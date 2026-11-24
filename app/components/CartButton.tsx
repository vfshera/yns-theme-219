import { ShoppingCart } from "lucide-react";

/** Static cart link. Cart state, sidebar and actions are deferred. */
export function CartButton() {
  const itemCount: number = 0;

  return (
    <a
      href="/cart"
      className="relative rounded-full p-2 transition-colors hover:bg-secondary"
      aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      <ShoppingCart className="size-6" strokeWidth={1.5} />
      <span
        aria-hidden="true"
        className="absolute right-0.5 bottom-0.5 flex size-[1.125rem] items-center justify-center rounded-full bg-primary text-[0.6875rem] font-semibold text-primary-foreground"
      >
        {itemCount}
      </span>
    </a>
  );
}
