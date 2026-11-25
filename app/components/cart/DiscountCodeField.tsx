import { useEffect, useId, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatMoney } from "~/lib/format-money";
import { useCart } from "./CartProvider";
import { useCartConfig } from "./use-cart-config";
import type { CartResponse } from "~/lib/cart/types";

/** Cart-drawer discount field: 44px controls, inline errors, applied-code display. */
export function DiscountCodeField() {
  const { currency, locale } = useCartConfig();
  const { cart, syncCart, reconcile, mutate, isMutating } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);
  const inputId = useId();
  const messageId = useId();
  const [code, setCode] = useState("");

  const coupon = cart?.coupon;
  const pending = fetcher.state !== "idle";
  const label = coupon
    ? coupon.type === "percentage"
      ? `${Number(coupon.value) / 1000}% off`
      : `${formatMoney({ amount: coupon.value, currency, locale })} off`
    : null;

  useEffect(() => {
    if (!fetcher.data || synced.current === fetcher.data) {
      return;
    }

    synced.current = fetcher.data;

    if (fetcher.data.cart) {
      syncCart(fetcher.data.cart);
    } else {
      reconcile();
    }
  }, [fetcher.state, fetcher.data, syncCart, reconcile]);

  const error =
    fetcher.state === "idle" && fetcher.data && !fetcher.data.cart
      ? fetcher.data.error
      : undefined;

  const submit = (intent: "apply-coupon" | "remove-coupon", value?: string) => {
    const form = new FormData();
    form.append("intent", intent);
    if (value !== undefined) {
      form.append("code", value);
    }

    mutate(
      () => void fetcher.submit(form, { method: "post", action: "/cart" }),
    );
  };

  const apply = () => {
    const trimmed = code.trim();
    if (pending || isMutating || !trimmed) {
      return;
    }

    // Clear immediately so a failed code starts from a clean field.
    setCode("");
    submit("apply-coupon", trimmed);
  };

  const errorMessage = error ? (
    <p id={messageId} role="alert" className="text-sm text-destructive">
      {error}
    </p>
  ) : null;

  if (coupon) {
    return (
      <div className="grid gap-2">
        <div
          role="status"
          className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-green-700/30 bg-green-50 pl-3 text-green-900"
        >
          <p className="min-w-0 py-2 text-sm">
            <span className="font-semibold break-all">
              {coupon.code} applied
            </span>{" "}
            <span className="whitespace-nowrap">{label}</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-11 shrink-0 px-3 text-sm text-green-900 underline underline-offset-2 hover:bg-green-100 hover:text-green-950"
            aria-label={`Remove discount code ${coupon.code}`}
            aria-busy={pending || undefined}
            disabled={pending || isMutating}
            onClick={() => submit("remove-coupon")}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Remove"}
          </Button>
        </div>
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        Discount code
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          name="discountCode"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          className="h-11 min-w-0 flex-1 text-base"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          value={code}
          readOnly={pending}
          onChange={(event) => {
            setCode(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 px-4 text-base"
          disabled={pending || isMutating || !code.trim()}
          aria-busy={pending || undefined}
          onClick={apply}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Apply
        </Button>
      </div>
      {errorMessage}
    </div>
  );
}
