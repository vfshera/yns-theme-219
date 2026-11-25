import type { Route } from "./+types/index";
import { BannerCarousel } from "~/components/BannerCarousel";
import { HomeProducts } from "~/components/HomeProducts";
import { ShopTiles } from "~/components/ShopTiles";
import {
  getBannerSlides,
  getProducts,
  getShopTiles,
  getStoreInfo,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader() {
  return {
    info: getStoreInfo(),
    slides: getBannerSlides(),
    tiles: getShopTiles(),
    products: getProducts(8),
    config: getStoreConfig(),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const { storeName, storeDescription } = loaderData.info;
  const origin = matches[0].loaderData.origin;
  const url = `${origin}${location.pathname}`;
  const description =
    storeDescription ??
    "Considered things for everyday living, in soft colours and simple shapes.";
  const image = loaderData.products[0]?.images[0];
  const ogImage = image ? `${origin}${image}` : undefined;

  return [
    { title: storeName },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: storeName },
    { property: "og:description", content: description },
    ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    {
      name: "twitter:card",
      content: ogImage ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: storeName },
    { name: "twitter:description", content: description },
    ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: storeName,
        url,
        description,
        publisher: { "@type": "Organization", name: storeName },
      },
    },
  ];
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { info, slides, tiles, products, config } = loaderData;

  return (
    <div className="layout pt-6 pb-24 lg:pt-8 lg:pb-32">
      <h1 className="sr-only">{info.storeName}</h1>
      {slides.length > 0 && <BannerCarousel slides={slides} />}
      <ShopTiles tiles={tiles} />
      <HomeProducts products={products} config={config} />
    </div>
  );
}
