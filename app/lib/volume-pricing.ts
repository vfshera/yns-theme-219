import { displayPrice } from "~/lib/pricing";
import type { TaxBehavior } from "~/lib/pricing";

/** Universal tier shape, shared by fixtures, the UI and both cart repricers. */
export type VolumeTier = {
  id: string;
  price: string;
  priceGross?: string | null;
  minQuantity: number;
  maxQuantity: number | null;
  /** Null applies to every variant of the product; an id restricts the tier to one variant. */
  productVariantId: string | null;
};

/** Variant-specific tiers win over product-wide ones; both are ordered by breakpoint. */
export function resolveVolumeTiers(
  tiers: readonly VolumeTier[] | null | undefined,
  variantId: string,
): VolumeTier[] {
  const all = tiers ?? [];
  const specific = all.filter((tier) => tier.productVariantId === variantId);
  const applicable =
    specific.length > 0
      ? specific
      : all.filter((tier) => tier.productVariantId === null);

  return [...applicable].sort((a, b) => a.minQuantity - b.minQuantity);
}

/** Scan from the highest breakpoint down; bounds are inclusive. */
export function resolveVolumeTier(
  tiers: readonly VolumeTier[] | null | undefined,
  variantId: string,
  quantity: number,
): VolumeTier | null {
  const resolved = resolveVolumeTiers(tiers, variantId);

  for (let index = resolved.length - 1; index >= 0; index -= 1) {
    const tier = resolved[index];
    if (
      quantity >= tier.minQuantity &&
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    ) {
      return tier;
    }
  }

  return null;
}

/** The tax-aware unit price of the active tier, or null when no tier applies. */
export function volumeUnitPrice(
  tiers: readonly VolumeTier[] | null | undefined,
  variantId: string,
  quantity: number,
  taxBehavior: TaxBehavior,
): string | null {
  const tier = resolveVolumeTier(tiers, variantId, quantity);

  return tier ? (displayPrice(tier, taxBehavior) ?? tier.price) : null;
}

/** "3–4" or "5+", for the tier table. */
export function tierRangeLabel(tier: VolumeTier): string {
  return tier.maxQuantity === null
    ? `${tier.minQuantity}+`
    : `${tier.minQuantity}–${tier.maxQuantity}`;
}
