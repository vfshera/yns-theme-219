import { planLabel } from "~/lib/cart/cart-math";
import { cn } from "~/lib/utils";

export type PlanOption = {
  id: string;
  name: string;
  discountPercent: number;
  benefits: string | null;
};

/** Plan price is authoritative in the cart; this only names the choices. */
export function SubscriptionOptions({
  plans,
  value,
  onChange,
  allowOneTime,
}: {
  plans: readonly PlanOption[];
  value: string | null;
  onChange: (planId: string | null) => void;
  allowOneTime: boolean;
}) {
  const options = [
    ...(allowOneTime
      ? [{ id: null, label: "One-time purchase", detail: null }]
      : []),
    ...plans.map((plan) => ({
      id: plan.id,
      label: planLabel(plan),
      detail: plan.benefits,
    })),
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="mb-3 text-sm font-medium">Purchase</legend>
      {options.map((option) => (
        <label
          key={option.id ?? "one-time"}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 transition-colors hover:bg-secondary",
            value === option.id && "border-foreground",
          )}
        >
          <input
            type="radio"
            name="purchase-plan"
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className="mt-0.5 size-4 shrink-0 accent-foreground"
          />
          <span className="space-y-1">
            <span className="block text-sm font-medium">{option.label}</span>
            {option.detail && (
              <span className="block text-xs text-muted-foreground">
                {option.detail}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
