/** Types for the cookie-identified mock cart. Mirrors the Store API cart shape. */

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
  combinations: {
    variantValue: {
      variantType: { label: string };
      value: string;
    };
  }[];
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
};

export type CartLineItem = {
  quantity: number;
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
};
