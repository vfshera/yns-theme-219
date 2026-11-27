import type { JSONContent } from "@tiptap/core";
import type { Bundle, BundlePricingMode } from "~/lib/bundles/types";
import type { VariantCombination } from "~/lib/variants/types";
import type { VolumeTier } from "~/lib/volume-pricing";

/** Minimal contracts for the Store API shapes this app actually uses. */
export type ApiMeta = {
  count: number;
  offset: number;
  limit: number;
};

export type ApiList<T> = {
  data: T[];
  meta: ApiMeta;
};

export type ProductVariant = {
  id: string;
  price: string;
  priceGross: string;
  /** Compare-at price; rendered as a struck price only when it exceeds `price`. */
  originalPrice?: string | null;
  originalPriceGross?: string | null;
  /** Null means unlimited stock; 0 means sold out. */
  stock: number | null;
  images: string[];
  combinations: VariantCombination[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string | null;
  description: string | null;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  discountPercent: number;
  benefits: string | null;
  active: boolean;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  type: "product" | "bundle";
  status: "published";
  images: string[];
  summary: string | null;
  content: string | null;
  category: Category | null;
  subscriptionMode: "optional" | "only" | "rolling";
  subscriptionPlanProducts: { subscriptionPlan: SubscriptionPlan }[];
  variants: ProductVariant[];
  /** Quantity breakpoints; variant-specific rows take precedence over product-wide ones. */
  volumePricingTiers: VolumeTier[] | null;
  /** Present only when `type === "bundle"`; the options offered inside it. */
  bundle?: Bundle;
  /** Raw bundle pricing fields, mirroring the Store API contract. */
  bundlePriceMode: BundlePricingMode;
  bundleFixedPriceAmount: string | null;
  bundleFixedPriceAmountGross: string | null;
  bundleAmountOffAmount: string | null;
  bundleAmountOffAmountGross: string | null;
  bundleDiscountPercentage: number | null;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  productCollections: { product: Product }[];
  metafieldRules: unknown[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  active: boolean;
  tag: string | null;
  image: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  content: JSONContent | null;
  seo: { title: string; description: string; canonical: string } | null;
};

/**
 * Mock-only legal page shape. The real Store API supplies `contentHtml`; our fixtures use a
 * Markdown string so the demo pages can be authored simply. See the note in the legal route's
 * Markdown renderer.
 */
export type LegalPage = {
  id: string;
  key: "terms" | "privacyPolicy" | "returns";
  label: string;
  href: string;
  contentMarkdown: string;
  updatedAt: string;
};

export type NewsletterPopupSettings = {
  delaySeconds?: number;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  teaserText?: string;
  discountCode?: string;
};

export type Store = {
  name: string;
  currency: string;
  locale: string;
  taxBehavior: "inclusive";
  subdomain: string;
  settings: {
    storeDescription: string;
    freeShippingThreshold: string;
    enabledTools: {
      blog: boolean;
      contactForm: boolean;
      newsletter: boolean;
      newsletterPopup: boolean;
      restockNotifications: boolean;
      cookieConsent: boolean;
    };
    newsletterPopup?: NewsletterPopupSettings | null;
    defaultLanguage: string | null;
    enabledLanguages: Record<string, string>;
  };
};

export type MeResponse = {
  store: Store;
  storeBaseUrl: string;
  publicUrl: string;
};

export type SocialsResponse = {
  socials: Record<string, string | null>;
};

export type StoreResponse =
  | MeResponse
  | SocialsResponse
  | ApiList<Product>
  | ApiList<Category>
  | ApiList<Collection>
  | ApiList<LegalPage>
  | ApiList<Post>;
