import { plainText } from "~/lib/display";
import { formatMoney } from "~/lib/format-money";
import { getStoreConfig } from "./config.server";
import { pickEditorial } from "./editorial.server";
import { queryStore } from "./handlers.server";
import type {
  ApiList,
  Category,
  Collection,
  MeResponse,
  Product,
  SocialsResponse,
} from "./types";

export type ShopLink = { href: string; label: string };

export type ShopTile = { href: string; label: string; image: string | null };

export type BannerSlide = {
  href: string;
  title: string;
  description: string | null;
  image: string;
};

const shortMoney = (formatted: string) => formatted.replace(/\.00(?=\D*$)/, "");

/** Category names on some stores are written as paths ("Lamps > Desk"): show the last segment. */
const leafName = (name: string) => name.split(">").at(-1)?.trim() || name;

/** A manual collection without members opens an empty page, so it never shows up as a link. */
const isFilled = (collection: Collection) =>
  (collection.productCollections?.length ?? 0) > 0 ||
  (collection.metafieldRules?.length ?? 0) > 0;

const browse = <T>(path: string, params: URLSearchParams): T[] =>
  (queryStore(path, params) as ApiList<T>).data;

const activeParams = new URLSearchParams({ active: "true", limit: "12" });
const collectionParams = new URLSearchParams({ limit: "12" });

/** The store's own facts for the top bar and footer: nothing invented. */
export function getStoreInfo() {
  const { store } = queryStore("me") as MeResponse;
  const { currency, locale } = getStoreConfig();
  const socials = queryStore("socials") as SocialsResponse;
  const threshold = Number(store.settings.freeShippingThreshold ?? 0);
  const tools = store.settings.enabledTools;
  const socialLinks = Object.entries(socials.socials ?? {})
    .filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].startsWith("http"),
    )
    .map(([network, href]) => ({
      label:
        network === "x"
          ? "X"
          : network.charAt(0).toUpperCase() + network.slice(1),
      href,
    }));

  return {
    storeName: store.name || "Your Next Store",
    storeDescription: store.settings.storeDescription || null,
    freeShipping: threshold
      ? shortMoney(formatMoney({ amount: BigInt(threshold), currency, locale }))
      : null,
    blog: tools.blog ?? false,
    contact: tools.contactForm ?? false,
    socialLinks,
  };
}

/**
 * The original's "Categories" menu and "Shop" footer column. Top-level categories when the
 * store has them, its collections otherwise (or both, categories first).
 */
export function getShopLinks(): { label: string; links: ShopLink[] } {
  const categories = browse<Category>("categories", activeParams);
  const collections = browse<Collection>("collections", collectionParams);
  const categoryLinks: ShopLink[] = categories
    .filter((category) => !category.parentId)
    .map((category) => ({
      href: `/category/${category.slug}`,
      label: leafName(category.name),
    }));
  const collectionLinks: ShopLink[] = collections
    .filter(isFilled)
    .map((collection) => ({
      href: `/collection/${collection.slug}`,
      label: collection.name,
    }));

  return {
    label: categoryLinks.length > 0 ? "Categories" : "Collections",
    links: [...categoryLinks, ...collectionLinks],
  };
}

type ProductLike = { images: string[]; variants: { price: string }[] };

/** Photographed, priced products first: a card without a picture or price never leads a row. */
const rank = (product: ProductLike) =>
  (product.images.length > 0 ? 0 : 2) +
  (product.variants.some((variant) => Number(variant.price) > 0) ? 0 : 1);

export function photographedFirst<T extends ProductLike>(
  products: readonly T[],
): T[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => rank(a.product) - rank(b.product) || a.index - b.index)
    .map(({ product }) => product);
}

export function getProducts(limit: number): Product[] {
  const params = new URLSearchParams({
    active: "true",
    limit: String(Math.max(limit, 48)),
  });

  return photographedFirst(browse<Product>("products", params)).slice(0, limit);
}

/**
 * Home carousel: the original's pastel banners, one per shop section (all products, then the
 * store's categories and filled collections), each with an editorial photograph.
 */
export function getBannerSlides(): BannerSlide[] {
  const info = getStoreInfo();
  const categories = browse<Category>("categories", activeParams);
  const collections = browse<Collection>("collections", collectionParams);
  const sections = [
    {
      href: "/products",
      title: "Shop all products",
      description: info.storeDescription,
    },
    ...categories
      .filter((category) => !category.parentId)
      .map((category) => ({
        href: `/category/${category.slug}`,
        title: leafName(category.name),
        description: plainText(category.description) || null,
      })),
    ...collections.filter(isFilled).map((collection) => ({
      href: `/collection/${collection.slug}`,
      title: collection.name,
      description: plainText(collection.description) || null,
    })),
  ].slice(0, 4);
  const images = pickEditorial(sections.map((section) => section.title));

  return sections.map((section, index) => ({
    ...section,
    description:
      section.description?.split(/(?<=\.)\s/)[0] ||
      `Browse ${section.title.toLowerCase()} in one place.`,
    image: images[index] ?? "/images/pexels/sunglasses-yellow.jpg",
  }));
}

/**
 * The grey category tiles under the banner. Categories (pictured by their own image or their
 * first product), then collections, led by an "All products" tile so a thin catalogue still
 * fills a row.
 */
export function getShopTiles(): ShopTile[] {
  const categories = browse<Category>("categories", activeParams);
  const collections = browse<Collection>("collections", collectionParams);
  const products = getProducts(100);
  const imageAt = (index: number) => {
    const pictured = products.filter((product) => product.images.length > 0);

    return pictured.length > 0
      ? (pictured[index % pictured.length]?.images[0] ?? null)
      : null;
  };

  const categoryTiles: ShopTile[] = categories
    .filter((category) => !category.parentId)
    .map((category) => ({
      href: `/category/${category.slug}`,
      label: leafName(category.name),
      image:
        category.image ??
        products.find((product) => product.category?.id === category.id)
          ?.images[0] ??
        null,
    }));
  const collectionTiles: ShopTile[] = collections
    .filter(isFilled)
    .map((collection, index) => ({
      href: `/collection/${collection.slug}`,
      label: collection.name,
      image: collection.image ?? imageAt(index + 1),
    }));

  return [
    { href: "/products", label: "All products", image: imageAt(0) },
    ...categoryTiles,
    ...collectionTiles,
  ].slice(0, 10);
}
