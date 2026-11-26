import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "./CartProvider";
import type { CartResponse, SubscriptionPlanLabel } from "~/lib/cart/types";
import type { VariantCombination } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

type Variant = {
  id: string;
  price: string;
  priceGross: string;
  stock: number | null;
  images: string[];
  combinations: VariantCombination[];
};

/** The page resolves the variant from the URL; this button just buys what it is given. */
export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  planId = null,
  plan = null,
  disabled = false,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    volumePricingTiers?: VolumeTier[] | null;
  };
  variant: Variant | undefined;
  quantity?: number;
  planId?: string | null;
  plan?: SubscriptionPlanLabel | null;
  disabled?: boolean;
}) {
  const { dispatch, syncCart, reconcile, mutate, openCart } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);
  const soldOut =
    variant !== undefined && variant.stock !== null && variant.stock <= 0;

  useEffect(() => {
    if (!fetcher.data || synced.current === fetcher.data) {
      return;
    }

    synced.current = fetcher.data;

    if (fetcher.data.cart) {
      syncCart(fetcher.data.cart);
      openCart();
      toast.success(`${product.name} added to cart`);
    } else {
      reconcile();
      toast.error(fetcher.data.error ?? "Could not add to cart");
    }
  }, [
    fetcher.state,
    fetcher.data,
    syncCart,
    reconcile,
    openCart,
    product.name,
  ]);

  const add = () => {
    if (
      !variant ||
      disabled ||
      soldOut ||
      quantity < 1 ||
      (variant.stock !== null && quantity > variant.stock)
    ) {
      return;
    }

    // Instant feedback; the server's returned cart replaces it once the POST lands.
    dispatch({
      type: "ADD_ITEM",
      item: {
        quantity,
        subscriptionPlanId: planId,
        subscriptionPlan: plan,
        productVariant: {
          id: variant.id,
          price: variant.price,
          priceGross: variant.priceGross,
          images: variant.images,
          combinations: [...variant.combinations],
          product,
        },
      },
    });

    const form = new FormData();
    form.append("intent", "add");
    form.append("variantId", variant.id);
    form.append("quantity", String(quantity));
    if (planId) {
      form.append("subscriptionPlanId", planId);
    }

    mutate(
      () => void fetcher.submit(form, { method: "post", action: "/cart" }),
    );
  };

  const label =
    fetcher.state !== "idle"
      ? "Adding…"
      : !variant
        ? "Select options"
        : soldOut
          ? "Out of stock"
          : disabled
            ? "Unavailable"
            : plan
              ? plan.discountPercent > 0
                ? `Subscribe & save ${plan.discountPercent}%`
                : "Subscribe"
              : "Add to cart";

  return (
    <button
      type="button"
      onClick={add}
      disabled={!variant || disabled || soldOut || fetcher.state !== "idle"}
      className="btn-shimmer inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
      <ShoppingCart className="size-4" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
