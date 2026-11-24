/**
 * Tax-behavior-aware price selection. Prices are stored net; the API also returns a gross twin
 * for every net price field. `taxBehavior` decides which of the two a shopper sees. All helpers
 * here are pure: they pick a field, never compute tax. A missing gross twin degrades to net.
 */
export type TaxBehavior = "inclusive" | "exclusive";

type PriceField =
  | "price"
  | "originalPrice"
  | "calculatedPrice"
  | "prePromotionPrice"
  | "omnibusPrice";

type PriceSource = {
  readonly [K in PriceField | `${PriceField}Gross`]?: string | null;
};

/** A price source guaranteed to carry an effective `price`. */
export type PricedVariant = PriceSource & { readonly price: string };

export function displayPrice(
  source: PriceSource,
  taxBehavior: TaxBehavior,
  field: PriceField = "price",
): string | null {
  const net = source[field] ?? null;
  if (net === null || taxBehavior !== "inclusive") {
    return net;
  }

  return source[`${field}Gross`] ?? net;
}

function priceRange(
  variants: readonly PriceSource[],
  taxBehavior: TaxBehavior,
): { min: bigint; max: bigint } {
  const amounts = variants
    .map((variant) => displayPrice(variant, taxBehavior))
    .filter((value): value is string => value !== null)
    .map((value) => BigInt(value));

  const first = amounts[0] ?? BigInt(0);

  return amounts.reduce(
    (range, amount) => ({
      min: amount < range.min ? amount : range.min,
      max: amount > range.max ? amount : range.max,
    }),
    { min: first, max: first },
  );
}

/** Cheapest displayed price, marked `from` when the variants are priced differently. */
export function listingPrice(
  variants: readonly PricedVariant[],
  taxBehavior: TaxBehavior,
) {
  if (variants.length === 0) {
    return null;
  }

  const { min, max } = priceRange(variants, taxBehavior);

  return { amount: min, from: min !== max };
}
