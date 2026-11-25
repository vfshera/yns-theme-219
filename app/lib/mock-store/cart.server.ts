import { itemKey } from "~/lib/cart/cart-math";
import { getStoreConfig } from "./config.server";
import { queryStore } from "./handlers.server";
import type { ApiList, Product } from "./types";
import type { Cart, CartLineItem, Coupon } from "~/lib/cart/types";

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

/** Build a source-shaped line from a fixture variant; `v-<productId>` is the fixture id. */
function makeLine(variantId: string, quantity: number): CartLineItem | null {
  const product = allProducts().find((entry) =>
    entry.variants.some((variant) => variant.id === variantId),
  );
  const variant = product?.variants.find((entry) => entry.id === variantId);

  if (!product || !variant) {
    return null;
  }

  return {
    quantity,
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

/** Recompute net/gross totals (minor units) after every mutation, applying the coupon. */
function reprice(cart: Cart): Cart {
  const { taxBehavior } = getStoreConfig();
  let net = 0n;
  let gross = 0n;

  for (const item of cart.lineItems) {
    const quantity = BigInt(item.quantity);
    net += BigInt(item.productVariant.price) * quantity;
    gross += BigInt(item.productVariant.priceGross) * quantity;
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
}: {
  id: string;
  variantId: string;
  quantity: number;
  mode?: "add" | "set";
}): Cart | null {
  const cart = getCart(id);
  if (!cart) {
    return null;
  }

  const line = makeLine(variantId, quantity);
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

export function removeLine(id: string, variantId: string): Cart | null {
  const cart = getCart(id);
  if (!cart) {
    return null;
  }

  const key = `v-${variantId.replace(/^v-/, "")}:`;
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
