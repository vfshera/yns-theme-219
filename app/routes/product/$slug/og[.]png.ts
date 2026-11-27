import type { Route } from "./+types/og[.]png";
import { formatMoney } from "~/lib/format-money";
import { listingPrice } from "~/lib/pricing";
import { isVideoUrl } from "~/lib/utils";
import {
  getProductBySlug,
  getStoreInfo,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";
import {
  OG_SIZE,
  renderOgImage,
  renderOgMarkup,
  resolveOgImageSource,
} from "./+/og-image";
import type { ProductOgCardProps } from "./+/ProductOgCard";

const firstPhoto = (images: string[]) =>
  images.find((src) => !isVideoUrl(src)) ?? null;

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const product = getProductBySlug(params.slug);
  if (!product) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const config = getStoreConfig();
  const listing = listingPrice(product.variants, config.taxBehavior);
  const props: ProductOgCardProps = {
    storeName: getStoreInfo().storeName,
    productName: product.name,
    price: listing
      ? formatMoney({
          amount: listing.amount,
          currency: config.currency,
          locale: config.locale,
        })
      : null,
    summary: product.summary ?? null,
    image: await resolveOgImageSource(firstPhoto(product.images) ?? ""),
  };

  if (url.searchParams.get("html") === "true") {
    return new Response(renderOgMarkup(props), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const { bytes, hit } = await renderOgImage({
      props,
      origin,
      slug: params.slug,
      fresh:
        url.searchParams.has("fresh") ||
        url.searchParams.get("debug") === "true",
      debug: url.searchParams.get("debug") === "true",
    });

    return new Response(
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
      {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
          "X-Og-Cache": hit ? "HIT" : "MISS",
          "X-Og-Width": String(OG_SIZE.width),
          "X-Og-Height": String(OG_SIZE.height),
        },
      },
    );
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : String(error),
      {
        status: 500,
      },
    );
  }
}
