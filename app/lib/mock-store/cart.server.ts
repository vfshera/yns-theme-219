import { bundlePricing, bundleUnitPrice } from "~/lib/bundles/pricing";
import {
  bundleItemResolver,
  resolveBundleSelections,
} from "~/lib/bundles/selections";
import { applyPercentDiscount, itemKey, lineKey } from "~/lib/cart/cart-math";
import { getStoreConfig } from "./config.server";
import { queryStore } from "./handlers.server";
import type { ApiList, Product } from "./types";
import type { BundleLine, BundleSelection } from "~/lib/bundles/types";
import type {
  Cart,
  CartLineItem,
  Coupon,
  SubscriptionPlanLabel,
} from "~/lib/cart/types";

/**
 * Stateful sibling of the pure mock catalog. The Map stands in for the Store API's
 * server-held carts: it is per-process, so a dev restart invalidates old cookies.
 */
const carts = new Map<string, Cart>();
const ALL_PRODUCTS = new URLSearchParams({ limit: "100" });
const WELCOME10: Coupon = {
  code: "WELCOME10",
  type: "percentage",
  value: "10000",
};
let idCounter = 0;

const allProducts = (): Product[] =>
  (queryStore("products", ALL_PRODUCTS) as ApiList<Product>).data;

/** Build a source-shaped line from any fixture variant, including multi-variant ones. */
function makeLine(
  variantId: string,
  quantity: number,
  planId?: string | null,
  bundle: BundleLine | null = null,
): CartLineItem | null {
  const product = allProducts().find((entry) =>
    entry.variants.some((variant) => variant.id === variantId),
  );
  const variant = product?.variants.find((entry) => entry.id === variantId);

  if (!product || !variant) {
    return null;
  }

  let subscriptionPlan: SubscriptionPlanLabel | null = null;
  if (bundle) {
    planId = null;
  } else if (planId) {
    const plan = product.subscriptionPlanProducts
      .map(({ subscriptionPlan: entry }) => entry)
      .find((entry) => entry.id === planId && entry.active);

    if (!plan) {
      return null;
    }

    subscriptionPlan = {
      name: plan.name,
      discountPercent: plan.discountPercent,
    };
  }

  return {
    quantity,
    subscriptionPlanId: planId ?? null,
    subscriptionPlan,
    bundle,
    productVariant: {
      id: variant.id,
      price: variant.price,
      priceGross: variant.priceGross,
      images: variant.images,
      combinations: variant.combinations,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
      },
    },
  };
}

/** Build a priced bundle descriptor for a cart line from a validated selection set. */
export function makeBundleLine(
  product: Product,
  selections: readonly BundleSelection[],
): BundleLine | null {
  if (product.type !== "bundle" || !product.bundle) {
    return null;
  }

  const resolved = resolveBundleSelections(
    selections,
    bundleItemResolver(product.bundle),
  );

  if (!resolved) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    pricing: bundlePricing(product),
    discountPercentage: product.bundle.discountPercentage,
    selections: resolved,
  };
}

/** Recompute net/gross totals (minor units) after every mutation, applying the coupon. */
function reprice(cart: Cart): Cart {
  const { taxBehavior } = getStoreConfig();
  let net = 0n;
  let gross = 0n;

  for (const item of cart.lineItems) {
    const quantity = BigInt(item.quantity);
    const percent = item.subscriptionPlan?.discountPercent ?? 0;
    const netUnit = item.bundle
      ? bundleUnitPrice(item.bundle, "exclusive")
      : applyPercentDiscount(BigInt(item.productVariant.price), percent);
    const grossUnit = item.bundle
      ? bundleUnitPrice(item.bundle, "inclusive")
      : applyPercentDiscount(BigInt(item.productVariant.priceGross), percent);

    net += netUnit * quantity;
    gross += grossUnit * quantity;
  }

  let subtotalNet = Number(net);
  let subtotalGross = Number(gross);
  const coupon = cart.coupon;

  if (coupon?.type === "percentage") {
    const thousandths = Number(coupon.value);
    if (Number.isFinite(thousandths) && thousandths > 0) {
      const factor = 1 - thousandths / 100_000;
      subtotalNet = Math.round(subtotalNet * factor);
      subtotalGross = Math.round(subtotalGross * factor);
    }
  } else if (coupon?.type === "fixed") {
    const amount = Math.max(Number(coupon.value), 0);
    if (Number.isFinite(amount)) {
      subtotalNet = Math.max(subtotalNet - amount, 0);
      subtotalGross = Math.max(subtotalGross - amount, 0);
    }
  }

  return {
    ...cart,
    subtotalNet,
    subtotalGross,
    subtotal: taxBehavior === "inclusive" ? subtotalGross : subtotalNet,
  };
}

export function createCart(): Cart {
  const id = `cart-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
  const cart: Cart = {
    id,
    lineItems: [],
    subtotal: 0,
    subtotalNet: 0,
    subtotalGross: 0,
    coupon: null,
  };
  carts.set(id, cart);

  return cart;
}

export function getCart(id: string | null): Cart | null {
  return (id && carts.get(id)) || null;
}

export function upsertLine({
  id,
  variantId,
  quantity,
  mode = "add",
  planId = null,
  bundle = null,
}: {
  id: string;
  variantId: string;
  quantity: number;
  mode?: "add" | "set";
  planId?: string | null;
  bundle?: BundleLine | null;
}): Cart | null {
  const cart = getCart(id);
  if (!cart) {
    return null;
  }

  const line = makeLine(variantId, quantity, planId, bundle);
  if (!line) {
    return null;
  }

  const key = itemKey(line);
  const lineItems = [...cart.lineItems];
  const index = lineItems.findIndex((item) => itemKey(item) === key);

  if (mode === "set" && quantity <= 0) {
    if (index === -1) {
      return cart;
    }

    lineItems.splice(index, 1);
  } else if (index === -1) {
    lineItems.push(line);
  } else if (mode === "set") {
    lineItems[index] = line;
  } else {
    lineItems[index] = {
      ...lineItems[index],
      quantity: lineItems[index].quantity + quantity,
    };
  }

  const next = reprice({ ...cart, lineItems });
  carts.set(id, next);

  return next;
}

export function removeLine(
  id: string,
  variantId: string,
  planId?: string | null,
  bundleSelections?: readonly BundleSelection[] | null,
): Cart | null {
  const cart = getCart(id);
  if (!cart) {
    return null;
  }

  const key = lineKey(variantId, planId, bundleSelections);
  const lineItems = cart.lineItems.filter((item) => itemKey(item) !== key);

  if (lineItems.length === cart.lineItems.length) {
    return cart;
  }

  const next = reprice({ ...cart, lineItems });
  carts.set(id, next);

  return next;
}

export function applyCoupon(id: string, code: string): Cart | null {
  const cart = getCart(id);
  if (
    !cart ||
    cart.lineItems.length === 0 ||
    code.toUpperCase() !== WELCOME10.code
  ) {
    return null;
  }

  const next = reprice({ ...cart, coupon: WELCOME10 });
  carts.set(id, next);

  return next;
}

export function removeCoupon(id: string): Cart | null {
  const cart = getCart(id);
  if (!cart) {
    return null;
  }

  const next = reprice({ ...cart, coupon: null });
  carts.set(id, next);

  return next;
}
