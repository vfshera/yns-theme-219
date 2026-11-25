import { displayPrice } from "~/lib/pricing";
import type { Cart, CartAction, CartLineItem } from "./types";
import type { TaxBehavior } from "~/lib/pricing";

export { type Cart, type CartLineItem, type CartAction } from "./types";

/** One line is one variant; the optional plan argument is kept for deferred subscriptions. */
export const lineKey = (
  variantId: string,
  subscriptionPlanId?: string | null,
) => `${variantId}:${subscriptionPlanId ?? ""}`;

export const itemKey = (item: CartLineItem) => lineKey(item.productVariant.id);

/** The options that tell two lines of one product apart (empty for flat fixtures). */
export const lineOptions = (item: CartLineItem) =>
  item.productVariant.combinations
    .map(
      ({ variantValue }) =>
        `${variantValue.variantType.label}: ${variantValue.value}`,
    )
    .join(" / ");

/** Unit price in the shopper's basis, choosing the gross twin when tax is inclusive. */
export function getLineItemUnitPrice(
  item: CartLineItem,
  taxBehavior: TaxBehavior,
): bigint {
  const price = displayPrice(item.productVariant, taxBehavior);

  return BigInt(price ?? item.productVariant.price);
}

/**
 * Use the server's total when we have one (it already includes discounts), otherwise sum
 * the display prices locally — e.g. for an optimistic cart whose totals were just cleared.
 */
export function getCartDisplaySubtotal(
  cart: Cart | null,
  taxBehavior: TaxBehavior,
): bigint {
  if (cart && cart.subtotal !== null) {
    return BigInt(Math.round(cart.subtotal));
  }

  return (cart?.lineItems ?? []).reduce(
    (sum, item) =>
      sum + getLineItemUnitPrice(item, taxBehavior) * BigInt(item.quantity),
    0n,
  );
}

/** Any local edit invalidates the server totals; fall back to summing display prices. */
const withoutStaleTotals = (cart: Cart): Cart => ({
  ...cart,
  subtotal: null,
  subtotalNet: null,
  subtotalGross: null,
});

/** Pure reducer for instant feedback only; the server's returned cart replaces it on success. */
export function cartReducer(
  state: Cart | null,
  action: CartAction,
): Cart | null {
  if (!state) {
    return action.type === "ADD_ITEM"
      ? {
          id: "local",
          lineItems: [action.item],
          subtotal: null,
          subtotalNet: null,
          subtotalGross: null,
          coupon: null,
        }
      : state;
  }

  const next = applyAction(state, action);

  return next !== state ? withoutStaleTotals(next) : state;
}

function applyAction(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "INCREASE":
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          itemKey(item) === action.key
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };

    case "DECREASE":
      return {
        ...state,
        lineItems: state.lineItems.flatMap((item) => {
          if (itemKey(item) !== action.key) {
            return [item];
          }

          return item.quantity - 1 <= 0
            ? []
            : [{ ...item, quantity: item.quantity - 1 }];
        }),
      };

    case "REMOVE":
      return {
        ...state,
        lineItems: state.lineItems.filter(
          (item) => itemKey(item) !== action.key,
        ),
      };

    case "ADD_ITEM": {
      const key = itemKey(action.item);
      const existing = state.lineItems.find((item) => itemKey(item) === key);

      return {
        ...state,
        lineItems: existing
          ? state.lineItems.map((item) =>
              itemKey(item) === key
                ? { ...item, quantity: item.quantity + action.item.quantity }
                : item,
            )
          : [...state.lineItems, action.item],
      };
    }
  }
}
