import { useEffect, useRef } from "react";
import { Link, useFetcher } from "react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { YnsMedia } from "~/components/YnsMedia";
import {
  bundleLabel,
  getLineItemUnitPrice,
  itemKey,
  lineOptions,
  planLabel,
} from "~/lib/cart/cart-math";
import { formatMoney } from "~/lib/format-money";
import { useCart } from "./CartProvider";
import { useCartConfig } from "./use-cart-config";
import type { CartAction, CartLineItem, CartResponse } from "~/lib/cart/types";

export function CartItem({ item }: { item: CartLineItem }) {
  const { currency, locale, taxBehavior } = useCartConfig();
  const { dispatch, syncCart, reconcile, mutate, closeCart } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);

  const { productVariant, quantity } = item;
  const { product } = productVariant;
  const options = lineOptions(item);
  const planName = item.subscriptionPlan && planLabel(item.subscriptionPlan);
  const bundleName = item.bundle && bundleLabel(item.bundle);
  const image = productVariant.images[0] ?? product.images[0];
  const lineTotal = getLineItemUnitPrice(item, taxBehavior) * BigInt(quantity);

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

  const submit = (fields: Record<string, string>, optimistic: CartAction) => {
    dispatch(optimistic);

    const allFields = {
      ...fields,
      ...(item.subscriptionPlanId
        ? { subscriptionPlanId: item.subscriptionPlanId }
        : {}),
      ...(item.bundle?.selections.length
        ? {
            selections: JSON.stringify(
              item.bundle.selections.map(
                ({ groupId, variantId, quantity }) => ({
                  groupId,
                  variantId,
                  quantity,
                }),
              ),
            ),
          }
        : {}),
    };
    const form = new FormData();
    for (const [key, value] of Object.entries(allFields)) {
      form.append(key, value);
    }

    mutate(
      () => void fetcher.submit(form, { method: "post", action: "/cart" }),
    );
  };

  const setQuantity = (target: number, optimistic: CartAction) =>
    submit(
      {
        intent: "set-quantity",
        variantId: productVariant.id,
        quantity: String(target),
      },
      optimistic,
    );

  const handleRemove = () =>
    submit(
      { intent: "remove", variantId: productVariant.id },
      { type: "REMOVE", key: itemKey(item) },
    );

  const handleIncrement = () =>
    setQuantity(quantity + 1, { type: "INCREASE", key: itemKey(item) });

  const handleDecrement = () => {
    if (quantity <= 1) {
      handleRemove();

      return;
    }

    setQuantity(quantity - 1, { type: "DECREASE", key: itemKey(item) });
  };

  const pending = fetcher.state !== "idle";

  return (
    <div className="flex gap-3 rounded-lg border border-border p-2 transition-colors hover:bg-secondary">
      <Link
        to={`/product/${product.slug}`}
        onClick={closeCart}
        className="relative size-20 shrink-0 overflow-hidden border border-border bg-secondary"
      >
        {image && (
          <YnsMedia
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              to={`/product/${product.slug}`}
              onClick={closeCart}
              className="line-clamp-2 text-sm leading-tight font-semibold text-foreground hover:underline"
            >
              {product.name}
            </Link>
            {options && (
              <p className="text-xs text-muted-foreground">{options}</p>
            )}
            {planName && (
              <p className="text-xs text-muted-foreground">{planName}</p>
            )}
            {bundleName && (
              <p className="text-xs text-muted-foreground">{bundleName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center rounded-md border border-border bg-background transition-opacity"
            aria-busy={pending || undefined}
          >
            <button
              type="button"
              onClick={handleDecrement}
              className="flex size-7 shrink-0 items-center justify-center rounded-l-md transition-colors hover:bg-secondary"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center text-sm tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="flex size-7 shrink-0 items-center justify-center rounded-r-md transition-colors hover:bg-secondary"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-medium text-muted-foreground">
            {formatMoney({ amount: lineTotal, currency, locale })}
          </span>
        </div>
      </div>
    </div>
  );
}
