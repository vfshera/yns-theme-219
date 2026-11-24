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

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData.info.storeName },
  { tagName: "link", rel: "canonical", href: "/" },
];

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
