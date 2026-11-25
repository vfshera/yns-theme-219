import type { JSONContent } from "@tiptap/core";
import type { VariantCombination } from "~/lib/variants/types";

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
  stock: number;
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

export type Product = {
  id: string;
  name: string;
  slug: string;
  type: "product";
  status: "published";
  images: string[];
  summary: string | null;
  content: string | null;
  category: Category | null;
  subscriptionMode: "optional";
  variants: ProductVariant[];
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

export type Store = {
  name: string;
  currency: string;
  locale: string;
  taxBehavior: "inclusive";
  subdomain: string;
  settings: {
    storeDescription: string;
    freeShippingThreshold: string;
    enabledTools: { blog: boolean; contactForm: boolean };
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
