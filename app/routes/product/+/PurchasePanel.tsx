import { useState } from "react";
import { AddToCartButton, useCartConfig } from "~/components/cart";
import { formatListingPrice } from "~/lib/format-money";
import { PriceDisplay } from "./PriceDisplay";
import { QuantitySelector } from "./QuantitySelector";
import { SubscriptionOptions } from "./SubscriptionOptions";
import { VariantSelector } from "./VariantSelector";
import type { PlanOption } from "./SubscriptionOptions";
import type { VariantCombination } from "~/lib/variants/types";
import type { VariantWithOptions } from "~/lib/variants/types";

export type PurchaseVariant = Omit<VariantWithOptions, "combinations"> & {
  combinations: VariantCombination[];
  price: string;
  priceGross: string;
  stock: number | null;
  images: string[];
};

export function PurchasePanel({
  product,
  variants,
  selectedVariant,
  selectedOptions,
  plans,
  subscriptionMode,
}: {
  product: { id: string; name: string; slug: string; images: string[] };
  variants: readonly PurchaseVariant[];
  selectedVariant: PurchaseVariant | undefined;
  selectedOptions: Record<string, string>;
  plans: readonly PlanOption[];
  subscriptionMode: "optional" | "only" | "rolling";
}) {
  const config = useCartConfig();
  const price = formatListingPrice(
    selectedVariant ? [selectedVariant] : [],
    config,
  );

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

  const allowOneTime = subscriptionMode === "optional";
  const [planId, setPlanId] = useState<string | null>(
    allowOneTime ? null : (plans[0]?.id ?? null),
  );
  const plan = plans.find((entry) => entry.id === planId) ?? null;
  // A rolling box changes contents every cycle and is not sold through this panel.
  const purchasable =
    allowOneTime || (subscriptionMode === "only" && plan !== null);
  const soldOut =
    selectedVariant?.stock !== null && (selectedVariant?.stock ?? 0) <= 0;

  return (
    <div className="flex flex-col gap-6">
      <VariantSelector
        variants={variants}
        selectedVariant={selectedVariant}
        selectedOptions={selectedOptions}
      />
      {plans.length > 0 && (
        <SubscriptionOptions
          plans={plans}
          value={planId}
          onChange={setPlanId}
          allowOneTime={allowOneTime}
        />
      )}
      <div className="flex flex-col gap-3">
        {selectedVariant ? (
          <PriceDisplay variant={selectedVariant} config={config} />
        ) : (
          price && <span className="text-lg font-semibold">{price}</span>
        )}
        <div className="flex flex-wrap items-center gap-4">
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
            planId={planId}
            plan={
              plan
                ? { name: plan.name, discountPercent: plan.discountPercent }
                : null
            }
            disabled={!purchasable}
          />
        </div>
      </div>
    </div>
  );
}
