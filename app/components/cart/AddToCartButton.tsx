import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatListingPrice } from "~/lib/format-money";
import { useCart } from "./CartProvider";
import { useCartConfig } from "./use-cart-config";
import type { CartResponse } from "~/lib/cart/types";
import type { VariantCombination } from "~/lib/variants/types";

type Variant = {
  id: string;
  price: string;
  priceGross: string;
  stock: number;
  images: string[];
  combinations: VariantCombination[];
};

/** The page resolves the variant from the URL; this button just buys what it is given. */
export function AddToCartButton({
  product,
  variant,
  quantity = 1,
}: {
  product: { id: string; name: string; slug: string; images: string[] };
  variant: Variant | undefined;
  quantity?: number;
}) {
  const config = useCartConfig();
  const { dispatch, syncCart, reconcile, mutate, openCart } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);
  const price = formatListingPrice(variant ? [variant] : [], config);
  const soldOut = (variant?.stock ?? 0) <= 0;

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
    if (!variant || soldOut || quantity < 1 || quantity > variant.stock) {
      return;
    }

    // Instant feedback; the server's returned cart replaces it once the POST lands.
    dispatch({
      type: "ADD_ITEM",
      item: {
        quantity,
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
          : "Add to cart";

  return (
    <div className="flex flex-col gap-3">
      {price && <span className="text-lg font-semibold">{price}</span>}
      <button
        type="button"
        onClick={add}
        disabled={!variant || soldOut || fetcher.state !== "idle"}
        className="shimmer inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
        <ShoppingCart className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
