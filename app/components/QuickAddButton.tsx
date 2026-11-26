import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useFetcher } from "react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "~/components/cart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { CartLineItem, CartResponse } from "~/lib/cart/types";
import type { VariantCombination } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

/**
 * The card's client island: a nested button inside the card's <Link>, so it cancels
 * navigation and posts `intent=add` straight to /cart. Optimistic first, authoritative
 * cart on success, reconcile on failure (the same lifecycle as the purchase panel).
 */
export function QuickAddButton({
  variantId,
  variantPrice,
  variantPriceGross,
  variantImages,
  variantCombinations,
  product,
}: {
  variantId: string;
  variantPrice: string;
  variantPriceGross: string;
  variantImages: string[];
  variantCombinations: VariantCombination[];
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    volumePricingTiers?: VolumeTier[] | null;
  };
}) {
  const { dispatch, syncCart, reconcile, mutate, openCart } = useCart();
  const fetcher = useFetcher<CartResponse>();
  const synced = useRef<CartResponse | null>(null);

  useEffect(() => {
    if (!fetcher.data || synced.current === fetcher.data) {
      return;
    }

    synced.current = fetcher.data;

    if (fetcher.data.cart) {
      syncCart(fetcher.data.cart);
    } else {
      reconcile();
      toast.error(fetcher.data.error ?? "This item is out of stock");
    }
  }, [fetcher.data, syncCart, reconcile]);

  const add = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openCart();

    const item: CartLineItem = {
      quantity: 1,
      productVariant: {
        id: variantId,
        price: variantPrice,
        priceGross: variantPriceGross,
        images: variantImages,
        combinations: variantCombinations,
        product,
      },
    };

    dispatch({ type: "ADD_ITEM", item });

    const form = new FormData();
    form.append("intent", "add");
    form.append("variantId", variantId);
    form.append("quantity", "1");

    mutate(
      () => void fetcher.submit(form, { method: "post", action: "/cart" }),
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={add}
        aria-label={`Add ${product.name} to cart`}
        className="btn-shimmer absolute right-3 bottom-3 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all opacity-100 hover:scale-105 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <ShoppingCart className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Add to cart
      </TooltipContent>
    </Tooltip>
  );
}
