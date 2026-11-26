import { useCartConfig } from "~/components/cart";
import { formatMoney } from "~/lib/format-money";
import { displayPrice } from "~/lib/pricing";
import { cn } from "~/lib/utils";
import { tierRangeLabel, type VolumeTier } from "~/lib/volume-pricing";

/** The source's "Buy more, save more" table; the active row follows the current quantity. */
export function VolumePricingDisplay({
  tiers,
  quantity,
}: {
  tiers: readonly VolumeTier[] | null | undefined;
  quantity: number;
}) {
  const config = useCartConfig();
  if (!tiers || tiers.length === 0) {
    return null;
  }

  const active = [...tiers]
    .reverse()
    .find(
      (tier) =>
        quantity >= tier.minQuantity &&
        (tier.maxQuantity === null || quantity <= tier.maxQuantity),
    );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Buy more, save more</p>
      <div className="overflow-hidden rounded-lg border border-border text-sm">
        <table className="w-full">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                Quantity
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Price per unit
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr
                key={tier.id}
                className={cn(
                  index % 2 === 1 && "bg-muted/20",
                  active?.id === tier.id && "bg-foreground/5 font-semibold",
                )}
              >
                <td className="px-3 py-2">{tierRangeLabel(tier)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatMoney({
                    amount: BigInt(
                      displayPrice(tier, config.taxBehavior) ?? tier.price,
                    ),
                    currency: config.currency,
                    locale: config.locale,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
