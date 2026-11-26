/** Universal contracts shared by bundle fixtures, the cart and the product page. */

export type BundlePricingMode = "fixed" | "amount" | "percent";

export type BundleVariantOption = {
  type: string;
  value: string;
  colorValue: string | null;
};

/** A variant offered inside a bundle group, enriched by the server for display and pricing. */
export type BundleItem = {
  variantId: string;
  position: number;
  forced: boolean;
  defaultSelected: boolean;
  fixedQuantity: number;
  maxQuantity: number | null;
  label: string;
  price: string;
  priceGross: string;
  /** Null means unlimited stock; 0 means sold out. */
  stock: number | null;
  images: string[];
  options: BundleVariantOption[];
  productSlug: string;
};

/** The data a validator/pricer needs to resolve a variant id. */
export type BundleItemSource = Pick<
  BundleItem,
  | "label"
  | "price"
  | "priceGross"
  | "stock"
  | "images"
  | "options"
  | "productSlug"
>;

export type BundleGroup = {
  id: string;
  name: string | null;
  position: number;
  minQuantity: number;
  maxQuantity: number | null;
  allowDuplicates: boolean;
  items: BundleItem[];
};

export type Bundle = {
  discountPercentage: number | null;
  groups: BundleGroup[];
};

/** Raw pricing fields off the product, mirroring the Store API contract. */
export type BundlePricing = {
  mode: BundlePricingMode;
  fixedPriceAmount: string | null;
  fixedPriceAmountGross: string | null;
  amountOffAmount: string | null;
  amountOffAmountGross: string | null;
};

export type BundleSelection = {
  groupId: string;
  variantId: string;
  quantity: number;
};

/** A selection enriched with authoritative prices, carried on a cart line. */
export type PricedBundleSelection = BundleSelection & {
  label: string;
  price: string;
  priceGross: string;
};

export type BundleLine = {
  id: string;
  name: string;
  pricing: BundlePricing;
  discountPercentage: number | null;
  selections: PricedBundleSelection[];
};
