import { fixtures } from "./fixtures.server";
import type { Order } from "./types";
import type { CartLineItem } from "~/lib/cart/types";

/**
 * Module-level stand-in for the Store API's server-held orders. Phase 26 adds
 * `createOrderFromCart()` here, so reads and writes share one store.
 */
const orders = new Map<string, Order>();

function makeLine(
  productId: string,
  variantId: string,
  quantity: number,
): CartLineItem {
  const product = fixtures.products.find((entry) => entry.id === productId);
  const variant = product?.variants.find((entry) => entry.id === variantId);
  if (!product || !variant) {
    throw new Error(`Unknown order fixture variant: ${variantId}`);
  }

  return {
    quantity,
    productVariant: {
      id: variant.id,
      price: variant.price,
      priceGross: variant.priceGross,
      images: variant.images.length > 0 ? variant.images : product.images,
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

const seeded: Order = {
  id: "order-demo-1001",
  lookup: 1001,
  createdAt: "2026-11-20T12:00:00.000Z",
  customerEmail: "demo@example.com",
  lineItems: [
    makeLine("pastel-stationery-set", "v-pastel-stationery-set", 2),
    makeLine("canvas-tote-bag", "v-canvas-tote-bag", 1),
  ],
  shippingAddress: {
    name: "Demo Shopper",
    line1: "12 Pastel Lane",
    line2: null,
    city: "Springfield",
    state: "CA",
    postalCode: "90001",
    country: "US",
  },
  shipping: { name: "Standard", price: "0", priceGross: "0" },
  subtotal: 8000,
  total: 8000,
  tax: 0,
};
orders.set(seeded.id, seeded);

export function getOrderById(id: string): Order | null {
  return orders.get(id) ?? null;
}

export function listOrders(): Order[] {
  return [...orders.values()];
}
