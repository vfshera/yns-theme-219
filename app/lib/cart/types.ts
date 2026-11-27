/** Types for the cookie-identified mock cart. Mirrors the Store API cart shape. */

import type { BundleLine } from "~/lib/bundles/types";
import type { VariantCombination } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
};

export type CartVariant = {
  id: string;
  price: string;
  priceGross: string;
  images: string[];
  combinations: VariantCombination[];
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    /** Carried so both repricers can resolve volume tiers from plain cart data. */
    volumePricingTiers?: VolumeTier[] | null;
  };
};

/** The plan metadata a line needs to name itself and price itself locally. */
export type SubscriptionPlanLabel = {
  name: string;
  discountPercent: number;
};

export type CartLineItem = {
  quantity: number;
  /** The plan this line renews on; absent or null for a one-time purchase. */
  subscriptionPlanId?: string | null;
  subscriptionPlan?: SubscriptionPlanLabel | null;
  /** Set for a bundle line; bundles and subscription plans are mutually exclusive. */
  bundle?: BundleLine | null;
  productVariant: CartVariant;
};

export type Cart = {
  id: string;
  lineItems: CartLineItem[];
  /** Minor-unit totals from the server; null clears stale totals after an optimistic edit. */
  subtotal: number | null;
  subtotalNet: number | null;
  subtotalGross: number | null;
  coupon: Coupon | null;
};

export type CartAction =
  | { type: "ADD_ITEM"; item: CartLineItem }
  | { type: "INCREASE"; key: string }
  | { type: "DECREASE"; key: string }
  | { type: "REMOVE"; key: string };

/** Both the `/cart` loader and action answer with this shape. */
export type CartResponse = {
  cart: Cart | null;
  error?: string;
  /** Set by the mock place-order intent so the client can navigate to the confirmation. */
  orderId?: string;
};
