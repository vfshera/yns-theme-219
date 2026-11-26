import { formatMoney } from "~/lib/format-money";
import { displayPrice } from "~/lib/pricing";
import type { TaxBehavior } from "~/lib/pricing";

type SaleVariant = {
  price: string;
  priceGross?: string | null;
  originalPrice?: string | null;
  originalPriceGross?: string | null;
};

type SaleConfig = {
  currency: string;
  locale: string;
  taxBehavior: TaxBehavior;
};

/** Source parity: a compare-at price is shown only when the list price is higher. */
export function getSaleInfo(variant: SaleVariant, config: SaleConfig) {
  const price = BigInt(
    displayPrice(variant, config.taxBehavior) ?? variant.price,
  );
  const listPrice = BigInt(
    displayPrice(variant, config.taxBehavior, "originalPrice") ??
      displayPrice(variant, config.taxBehavior) ??
      variant.price,
  );
  const onSale = listPrice > price;
  const format = (amount: bigint) =>
    formatMoney({
      amount,
      currency: config.currency,
      locale: config.locale,
    });

  return {
    display: format(price),
    compareAt: onSale ? format(listPrice) : null,
    discountPercent: onSale
      ? Math.round((Number(listPrice - price) / Number(listPrice)) * 100)
      : null,
  };
}

export function PriceDisplay({
  variant,
  config,
}: {
  variant: SaleVariant;
  config: SaleConfig;
}) {
  const { display, compareAt, discountPercent } = getSaleInfo(variant, config);

  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-lg font-semibold">{display}</span>
      {compareAt && (
        <span className="text-base text-muted-foreground line-through">
          {compareAt}
        </span>
      )}
      {discountPercent ? (
        <span className="rounded-md bg-main px-2 py-0.5 text-xs font-semibold text-white">
          −{discountPercent}%
        </span>
      ) : null}
    </div>
  );
}
