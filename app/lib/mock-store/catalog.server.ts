import { plainText } from "~/lib/display";
import { formatMoney } from "~/lib/format-money";
import { getStoreConfig } from "./config.server";
import { pickEditorial } from "./editorial.server";
import { queryStore } from "./handlers.server";
import type {
  ApiList,
  Category,
  Collection,
  LegalPage,
  MeResponse,
  Post,
  Product,
  SocialsResponse,
} from "./types";
import type { CatalogSort } from "~/lib/catalog-sort";

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
    newsletter: tools.newsletter ?? false,
    newsletterPopup: tools.newsletterPopup ?? false,
    newsletterPopupSettings: store.settings.newsletterPopup ?? null,
    restockNotifications: tools.restockNotifications ?? false,
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

/**
 * Listing pages read the small mock catalog in one call and sort/paginate locally. This keeps
 * sorting correct across pages without adding new endpoints to the static mock API.
 */
const ALL_ITEMS = new URLSearchParams({ active: "true", limit: "100" });
const PAGE_SIZE = 12;

export type { CatalogSort };

export type CatalogPage = {
  products: Product[];
  count: number;
  page: number;
  totalPages: number;
};

export function parsePage(raw: string | null): number {
  const value = Number(raw);

  return Number.isInteger(value) && value > 0 ? value : 1;
}

const priceOf = (product: Product) => Number(product.variants[0]?.price ?? 0);

const sortProducts = (
  products: readonly Product[],
  sort: CatalogSort,
): Product[] => {
  const sorted = [...products];

  if (sort === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "price-asc") {
    return sorted.sort((a, b) => priceOf(a) - priceOf(b));
  }
  if (sort === "price-desc") {
    return sorted.sort((a, b) => priceOf(b) - priceOf(a));
  }

  return photographedFirst(sorted);
};

const toCatalogPage = (
  products: readonly Product[],
  page: number,
): CatalogPage => {
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    products: products.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    ),
    count: products.length,
    page: currentPage,
    totalPages,
  };
};

type BrowseOptions = {
  page: number;
  sort: CatalogSort;
  category?: string;
  query?: string;
};

const browseProductsForListing = ({
  page,
  sort,
  category,
  query,
}: BrowseOptions): CatalogPage => {
  const params = new URLSearchParams(ALL_ITEMS);

  if (category) {
    params.set("category", category);
  }
  if (query) {
    params.set("query", query);
  }

  const { data } = queryStore("products", params) as ApiList<Product>;

  return toCatalogPage(sortProducts(data, sort), page);
};

export function browseCatalogProducts(options: {
  page?: number;
  sort?: CatalogSort;
  category?: string;
}): CatalogPage {
  return browseProductsForListing({
    page: options.page ?? 1,
    sort: options.sort ?? "featured",
    category: options.category,
  });
}

export function searchProducts(options: {
  query: string;
  page?: number;
  sort?: CatalogSort;
  category?: string;
}): CatalogPage {
  return browseProductsForListing({
    page: options.page ?? 1,
    sort: options.sort ?? "featured",
    category: options.category,
    query: options.query,
  });
}

export function getCategoryBySlug(slug: string): Category | null {
  const { data } = queryStore("categories", ALL_ITEMS) as ApiList<Category>;

  return data.find((category) => category.slug === slug) ?? null;
}

export function getCategoryOptions(): { value: string; label: string }[] {
  const { data } = queryStore("categories", ALL_ITEMS) as ApiList<Category>;

  return data
    .filter((category) => !category.parentId)
    .map((category) => ({
      value: category.slug,
      label: leafName(category.name),
    }));
}

export function getCollectionBySlug(slug: string): Collection | null {
  const { data } = queryStore("collections", ALL_ITEMS) as ApiList<Collection>;

  return data.find((collection) => collection.slug === slug) ?? null;
}

/** A product looked up by its URL slug. Slugs are ids in the fixtures, but read by slug. */
export function getProductBySlug(slug: string): Product | null {
  const { data } = queryStore("products", ALL_ITEMS) as ApiList<Product>;

  return data.find((product) => product.slug === slug) ?? null;
}

/** The product owning a variant, used by the cart to validate subscription plans. */
export function getProductByVariantId(variantId: string): Product | null {
  const { data } = queryStore("products", ALL_ITEMS) as ApiList<Product>;

  return (
    data.find((product) =>
      product.variants.some((variant) => variant.id === variantId),
    ) ?? null
  );
}

/** A bundle product by id, used by the cart action as its validation backstop. */
export function getBundleById(id: string): Product | null {
  const { data } = queryStore("products", ALL_ITEMS) as ApiList<Product>;

  return (
    data.find((product) => product.type === "bundle" && product.id === id) ??
    null
  );
}

/** Legal pages shown in the footer Help column, in the order the source Store API returns them. */
export function getLegalLinks(): ShopLink[] {
  const { data } = queryStore("legal-pages", ALL_ITEMS) as ApiList<LegalPage>;

  return data.map((page) => ({
    href: `/legal${page.href}`,
    label: page.label,
  }));
}

export function getLegalPageBySlug(slug: string): LegalPage | null {
  const { data } = queryStore("legal-pages", ALL_ITEMS) as ApiList<LegalPage>;

  return data.find((page) => page.href === `/${slug}`) ?? null;
}

export function getPosts(limit: number): Post[] {
  const params = new URLSearchParams({
    active: "true",
    limit: String(Math.max(limit, 48)),
  });

  return (queryStore("posts", params) as ApiList<Post>).data.slice(0, limit);
}

export function getPostBySlug(slug: string): Post | null {
  const { data } = queryStore("posts", ALL_ITEMS) as ApiList<Post>;

  return data.find((post) => post.slug === slug) ?? null;
}

/** Blog product embeds store ids; fixtures use the product id as its slug too. */
export function getProductById(id: string): Product | null {
  const { data } = queryStore("products", ALL_ITEMS) as ApiList<Product>;

  return (
    data.find((product) => product.id === id || product.slug === id) ?? null
  );
}

/**
 * Same-category suggestions first, then other products so a thin category still fills the row.
 * The current product is always excluded.
 */
export function getRelatedProducts(
  productId: string,
  categorySlug?: string | null,
  limit = 10,
): Product[] {
  const others = getProducts(100).filter((product) => product.id !== productId);
  const inCategory = categorySlug
    ? others.filter((product) => product.category?.slug === categorySlug)
    : [];
  const categoryIds = new Set(inCategory.map((product) => product.id));
  const rest = others.filter((product) => !categoryIds.has(product.id));

  return [...inCategory, ...rest].slice(0, limit);
}
