import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

/** Header button: shows the live item count and opens the cart drawer. */
export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative rounded-full p-2 transition-colors hover:bg-secondary"
      aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      <ShoppingCart className="size-6" strokeWidth={1.5} aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute right-0.5 bottom-0.5 flex size-[1.125rem] items-center justify-center rounded-full bg-primary text-[0.6875rem] font-semibold text-primary-foreground"
      >
        {itemCount}
      </span>
    </button>
  );
}
