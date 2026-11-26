import type { BundleLine, BundlePricing, BundlePricingMode } from "./types";
import type { TaxBehavior } from "~/lib/pricing";

/** Collect the raw product fields into the pricing object the helpers consume. */
export function bundlePricing(fields: {
  bundlePriceMode: BundlePricingMode;
  bundleFixedPriceAmount: string | null;
  bundleFixedPriceAmountGross: string | null;
  bundleAmountOffAmount: string | null;
  bundleAmountOffAmountGross: string | null;
}): BundlePricing {
  return {
    mode: fields.bundlePriceMode,
    fixedPriceAmount: fields.bundleFixedPriceAmount,
    fixedPriceAmountGross: fields.bundleFixedPriceAmountGross,
    amountOffAmount: fields.bundleAmountOffAmount,
    amountOffAmountGross: fields.bundleAmountOffAmountGross,
  };
}

/** Pick the field matching the shopper's tax basis; a missing gross twin falls back to net. */
const amountInBasis = (
  net: string | null,
  gross: string | null,
  taxBehavior: TaxBehavior,
): string | null => {
  if (net === null) {
    return null;
  }

  return taxBehavior === "inclusive" ? (gross ?? net) : net;
};

/**
 * Preview/line total in minor units. The cart response remains authoritative; this mirrors the
 * core's fixed, amount-off and percent modes so the PDP and optimistic cart look right.
 * Percentages are stored thousandths-scaled by the platform, hence `pct * 1000 / 100_000`.
 */
export function priceTotal(
  sum: bigint,
  pricing: BundlePricing,
  discountPercent: number | null,
  taxBehavior: TaxBehavior,
): bigint {
  if (pricing.mode === "fixed") {
    const fixed = amountInBasis(
      pricing.fixedPriceAmount,
      pricing.fixedPriceAmountGross,
      taxBehavior,
    );

    return fixed !== null ? BigInt(fixed) : sum;
  }

  if (pricing.mode === "amount") {
    const off = BigInt(
      amountInBasis(
        pricing.amountOffAmount,
        pricing.amountOffAmountGross,
        taxBehavior,
      ) ?? "0",
    );

    return sum > off ? sum - off : 0n;
  }

  const pct = discountPercent ?? 0;

  return pct > 0
    ? sum - (sum * BigInt(Math.round(pct * 1000))) / 100_000n
    : sum;
}

/** Sum of the selected components before any bundle discount. */
export function bundleSubtotal(
  selections: readonly {
    price: string;
    priceGross: string;
    quantity: number;
  }[],
  taxBehavior: TaxBehavior,
): bigint {
  return selections.reduce(
    (sum, item) =>
      sum +
      BigInt(
        amountInBasis(item.price, item.priceGross, taxBehavior) ?? item.price,
      ) *
        BigInt(item.quantity),
    0n,
  );
}

/** Unit price of a bundle cart line, already carrying resolved component prices. */
export function bundleUnitPrice(
  bundle: BundleLine | null | undefined,
  taxBehavior: TaxBehavior,
): bigint {
  if (!bundle) {
    return 0n;
  }

  return priceTotal(
    bundleSubtotal(bundle.selections, taxBehavior),
    bundle.pricing,
    bundle.discountPercentage,
    taxBehavior,
  );
}
