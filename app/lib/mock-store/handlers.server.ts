import { fixtures } from "./fixtures.server";
import type { ApiList, Post, Product, StoreResponse } from "./types";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const integerParam = (
  params: URLSearchParams,
  key: string,
  fallback: number,
): number => {
  const raw = params.get(key);
  if (raw === null) {
    return fallback;
  }

  const value = Number(raw);

  return Number.isInteger(value) && value >= 0 ? value : fallback;
};

const list = <T>(items: readonly T[], params: URLSearchParams): ApiList<T> => {
  const limit = Math.min(
    integerParam(params, "limit", DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const offset = integerParam(params, "offset", 0);

  return {
    data: items.slice(offset, offset + limit),
    meta: { count: items.length, offset, limit },
  };
};

const browseProducts = (params: URLSearchParams): Product[] => {
  const query = params.get("query")?.trim().toLowerCase();
  const category = params.get("category");
  const activeOnly = params.get("active") !== "false";

  return fixtures.products.filter((product) => {
    if (activeOnly && product.status !== "published") {
      return false;
    }

    if (
      category &&
      product.category?.id !== category &&
      product.category?.slug !== category
    ) {
      return false;
    }
    if (
      query &&
      !`${product.name} ${product.summary ?? ""}`.toLowerCase().includes(query)
    ) {
      return false;
    }

    return true;
  });
};

const browsePosts = (params: URLSearchParams): Post[] => {
  const activeOnly = params.get("active") !== "false";

  return fixtures.posts.filter((post) => !activeOnly || post.active);
};

type Handler = (params: URLSearchParams, origin: string) => StoreResponse;

/** The single registry of mock endpoints. The HTTP route and server helpers share it. */
const handlers: Record<string, Handler> = {
  me: (_params, origin) => fixtures.me(origin),
  products: (params) => list(browseProducts(params), params),
  "products/filters": (params) => list([], params),
  categories: (params) => list(fixtures.categories, params),
  collections: (params) => list(fixtures.collections, params),
  posts: (params) => list(browsePosts(params), params),
  socials: () => fixtures.socials,
  "legal-pages": (params) => list(fixtures.legalPages, params),
  brands: (params) => list([], params),
};

export const queryStore = (
  path: string,
  params: URLSearchParams = new URLSearchParams(),
  origin = "http://localhost:5173",
): StoreResponse => {
  const endpoint = path.replace(/^\/+|\/+$/g, "");

  return handlers[endpoint]?.(params, origin) ?? list([], params);
};
