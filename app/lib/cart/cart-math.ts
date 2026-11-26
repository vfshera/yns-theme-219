import { bundleUnitPrice } from "~/lib/bundles/pricing";
import { bundleKey } from "~/lib/bundles/selections";
import { displayPrice } from "~/lib/pricing";
import type {
  Cart,
  CartAction,
  CartLineItem,
  SubscriptionPlanLabel,
} from "./types";
import type { BundleLine, BundleSelection } from "~/lib/bundles/types";
import type { TaxBehavior } from "~/lib/pricing";

export {
  type Cart,
  type CartLineItem,
  type CartAction,
  type SubscriptionPlanLabel,
} from "./types";

/** Minor-unit discount with the same thousandths math the platform uses for plans. */
export const applyPercentDiscount = (
  amount: bigint,
  discountPercent: number,
): bigint => {
  if (discountPercent <= 0) {
    return amount;
  }

  return (
    amount - (amount * BigInt(Math.round(discountPercent * 1000))) / 100_000n
  );
};

/** "Every month · Save 10%". The plan name carries its cadence. */
export const planLabel = (plan: SubscriptionPlanLabel) =>
  plan.discountPercent > 0
    ? `${plan.name} · Save ${plan.discountPercent}%`
    : plan.name;

/** "Blush / A5 ×1 / Weekend Bag ×2", for the cart sidebar. */
export const bundleLabel = (bundle: BundleLine | null | undefined) =>
  (bundle?.selections ?? [])
    .map(
      (selection) =>
        `${selection.label}${selection.quantity > 1 ? ` ×${selection.quantity}` : ""}`,
    )
    .join(" / ");

/** One line is one variant on one plan, or one bundle with one set of picks. */
export const lineKey = (
  variantId: string,
  subscriptionPlanId?: string | null,
  bundleSelections?: readonly BundleSelection[] | null,
) => {
  const bundleSuffix = bundleSelections?.length
    ? `#${bundleKey(bundleSelections)}`
    : "";

  return `${variantId}:${subscriptionPlanId ?? ""}${bundleSuffix}`;
};

export const itemKey = (item: CartLineItem) =>
  lineKey(
    item.productVariant.id,
    item.subscriptionPlanId,
    item.bundle?.selections,
  );

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
  if (item.bundle) {
    return bundleUnitPrice(item.bundle, taxBehavior);
  }

  const price = displayPrice(item.productVariant, taxBehavior);
  const unit = BigInt(price ?? item.productVariant.price);

  return applyPercentDiscount(
    unit,
    item.subscriptionPlan?.discountPercent ?? 0,
  );
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
