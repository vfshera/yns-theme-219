import { Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export function QuantitySelector({
  quantity,
  onQuantityChange,
  max = 99,
  disabled = false,
}: {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  const upper = Math.max(1, Math.min(max, 99));

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">Quantity</legend>
      <div className="inline-flex items-center rounded-md border border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-r-none"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={disabled || quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="flex h-10 w-10 items-center justify-center text-sm font-medium tabular-nums">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-l-none"
          onClick={() => onQuantityChange(Math.min(upper, quantity + 1))}
          disabled={disabled || quantity >= upper}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </fieldset>
  );
}
