import { createElement } from "react";
import { Resvg } from "@resvg/resvg-js";
import { renderToStaticMarkup } from "react-dom/server";
import satori from "satori";
import { ProductOgCard, type ProductOgCardProps } from "./ProductOgCard";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

/** 1200x630, matching theme 219's `opengraph-image.tsx` and the OG standard. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

const CACHE_TTL_MS = 1000 * 60 * 60;
const cache = new Map<string, { bytes: Uint8Array; expires: number }>();

let fontsPromise: Promise<
  Array<{ name: string; data: Buffer; weight: 400; style: "normal" }>
> | null = null;

/** Local font: no runtime network call. The server is started from the repo root. */
function getFonts() {
  fontsPromise ??= readFile(
    join(process.cwd(), "app/assets/fonts/Geist-Regular.ttf"),
  ).then((data) => [
    { name: "Geist", data, weight: 400, style: "normal" as const },
  ]);

  return fontsPromise;
}

/** Satori refuses to fetch localhost URLs, so local public images become data URIs. */
const IMAGE_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
} as const;

export async function resolveOgImageSource(src: string) {
  const path = src.replace(/^\//, "");
  if (!path.startsWith("images/")) {
    return null;
  }

  const mime =
    IMAGE_MIME[extname(path).toLowerCase() as keyof typeof IMAGE_MIME];
  if (!mime) {
    return null;
  }

  const bytes = await readFile(join(process.cwd(), "public", path));

  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export function renderOgMarkup(props: ProductOgCardProps) {
  return renderToStaticMarkup(createElement(ProductOgCard, props));
}

export async function renderOgImage({
  props,
  origin,
  slug,
  fresh = false,
  debug = false,
}: {
  props: ProductOgCardProps;
  origin: string;
  slug: string;
  fresh?: boolean;
  debug?: boolean;
}): Promise<{ bytes: Uint8Array; hit: boolean }> {
  const key = `${origin}|${slug}`;
  if (!fresh) {
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return { bytes: cached.bytes, hit: true };
    }
  }

  const svg = await satori(createElement(ProductOgCard, props), {
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    fonts: await getFonts(),
    debug,
  });
  const resvg = new Resvg(svg);
  const bytes = new Uint8Array(resvg.render().asPng());

  cache.set(key, { bytes, expires: Date.now() + CACHE_TTL_MS });

  return { bytes, hit: false };
}
