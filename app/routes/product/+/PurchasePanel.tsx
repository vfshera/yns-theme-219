import { useState } from "react";
import { AddToCartButton } from "~/components/cart";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import type { VariantCombination } from "~/lib/variants/types";
import type { VariantWithOptions } from "~/lib/variants/types";

export type PurchaseVariant = Omit<VariantWithOptions, "combinations"> & {
  combinations: VariantCombination[];
  price: string;
  priceGross: string;
  stock: number;
  images: string[];
};

export function PurchasePanel({
  product,
  variants,
  selectedVariant,
  selectedOptions,
}: {
  product: { id: string; name: string; slug: string; images: string[] };
  variants: readonly PurchaseVariant[];
  selectedVariant: PurchaseVariant | undefined;
  selectedOptions: Record<string, string>;
}) {
  // Keyed by variant id so switching options resets the quantity without an effect.
  const [quantityState, setQuantityState] = useState({
    variantId: selectedVariant?.id,
    quantity: 1,
  });
  const quantity =
    quantityState.variantId === selectedVariant?.id
      ? quantityState.quantity
      : 1;
  const setQuantity = (value: number) =>
    setQuantityState({ variantId: selectedVariant?.id, quantity: value });

  const soldOut = (selectedVariant?.stock ?? 0) <= 0;

  return (
    <div className="flex flex-col gap-6">
      <VariantSelector
        variants={variants}
        selectedVariant={selectedVariant}
        selectedOptions={selectedOptions}
      />
      <div className="flex flex-col gap-3">
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={setQuantity}
          max={selectedVariant?.stock ?? 99}
          disabled={soldOut}
        />
        <AddToCartButton
          product={product}
          variant={selectedVariant}
          quantity={quantity}
        />
      </div>
    </div>
  );
}
