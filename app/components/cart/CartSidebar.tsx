import { Loader2, ShoppingCart } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { getCartDisplaySubtotal, itemKey } from "~/lib/cart/cart-math";
import { formatMoney } from "~/lib/format-money";
import { cn } from "~/lib/utils";
import { CartItem } from "./CartItem";
import { useCart } from "./CartProvider";
import { DiscountCodeField } from "./DiscountCodeField";
import { useCartConfig } from "./use-cart-config";

export function CartSidebar() {
  const { currency, locale, language, taxBehavior } = useCartConfig();
  const { cart, isOpen, closeCart, items, itemCount, subtotal, isMutating } =
    useCart();
  const coupon = cart?.coupon;
  const beforeDiscount = cart
    ? getCartDisplaySubtotal({ ...cart, subtotal: null }, taxBehavior)
    : 0n;
  const discount =
    coupon && beforeDiscount > subtotal ? beforeDiscount - subtotal : null;

  // /checkout is a proxied zone — keep this a plain <a>, never a soft <Link>.
  const checkoutUrl = language
    ? `/checkout?lang=${encodeURIComponent(language)}`
    : "/checkout";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="p-4 pb-3">
          <SheetTitle className="text-xl font-semibold">
            Cart ({itemCount})
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review items in your cart and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <ShoppingCart
              className="mb-3 size-20 text-secondary-foreground/30"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="mb-1 text-lg font-medium">Your cart is empty</p>
            <p className="mb-6 w-4/5 text-sm text-muted-foreground">
              Have a look around the shop and add whatever catches your eye.
            </p>
            <Button className="shimmer rounded-md" onClick={closeCart}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="flex flex-col gap-3 pb-4">
                {items.map((item) => (
                  <CartItem key={itemKey(item)} item={item} />
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="mt-auto border-t border-border pt-4">
              <div className="w-full space-y-4">
                <DiscountCodeField />

                {discount !== null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>
                        {formatMoney({
                          amount: beforeDiscount,
                          currency,
                          locale,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm font-medium text-green-700">
                      <span>Discount</span>
                      <span className="tabular-nums">
                        −{formatMoney({ amount: discount, currency, locale })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-base">
                  <span className="font-medium">
                    {discount !== null ? "Total" : "Subtotal"}
                  </span>
                  <span className="font-semibold">
                    {formatMoney({ amount: subtotal, currency, locale })}
                  </span>
                </div>

                {/* Tax is already inside the subtotal on an inclusive store. */}
                <p className="text-xs text-muted-foreground">
                  {taxBehavior === "inclusive"
                    ? "Shipping calculated at checkout"
                    : "Shipping and taxes calculated at checkout"}
                </p>

                <a
                  href={checkoutUrl}
                  aria-disabled={isMutating}
                  tabIndex={isMutating ? -1 : undefined}
                  onClick={(event) => {
                    if (isMutating) {
                      event.preventDefault();
                    }
                  }}
                  className={cn(
                    buttonVariants(),
                    "shimmer h-11 w-full rounded-md text-base font-medium",
                    isMutating && "pointer-events-none opacity-60",
                  )}
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    "Checkout"
                  )}
                </a>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Continue shopping
                </button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
