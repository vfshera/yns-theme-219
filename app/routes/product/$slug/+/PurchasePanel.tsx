import { useState } from "react";
import { AddToCartButton, useCartConfig } from "~/components/cart";
import { formatListingPrice } from "~/lib/format-money";
import { displayPrice } from "~/lib/pricing";
import { resolveVolumeTier } from "~/lib/volume-pricing";
import { PriceDisplay } from "./PriceDisplay";
import { QuantitySelector } from "./QuantitySelector";
import { SubscriptionOptions } from "./SubscriptionOptions";
import { VariantSelector } from "./VariantSelector";
import { VolumePricingDisplay } from "./VolumePricing";
import type { PlanOption } from "./SubscriptionOptions";
import type { VariantCombination } from "~/lib/variants/types";
import type { VariantWithOptions } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

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
  volumePricingTiers,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    volumePricingTiers?: VolumeTier[] | null;
  };
  variants: readonly PurchaseVariant[];
  selectedVariant: PurchaseVariant | undefined;
  selectedOptions: Record<string, string>;
  plans: readonly PlanOption[];
  subscriptionMode: "optional" | "only" | "rolling";
  volumePricingTiers: VolumeTier[] | null;
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
  const volumeTier = resolveVolumeTier(
    volumePricingTiers,
    selectedVariant?.id ?? "",
    quantity,
  );
  const volumePrice = volumeTier
    ? (displayPrice(volumeTier, config.taxBehavior) ?? volumeTier.price)
    : null;

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
          <PriceDisplay
            variant={selectedVariant}
            config={config}
            priceOverride={volumePrice}
            quantity={quantity}
          />
        ) : (
          price && <span className="text-lg font-semibold">{price}</span>
        )}
        {volumePricingTiers && volumePricingTiers.length > 0 && (
          <VolumePricingDisplay
            tiers={volumePricingTiers}
            quantity={quantity}
          />
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
