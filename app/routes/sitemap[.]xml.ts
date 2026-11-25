import type { Route } from "./+types/sitemap[.]xml";
import {
  getProducts,
  getShopLinks,
  getStoreInfo,
} from "~/lib/mock-store/catalog.server";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const paths = [
    "/",
    "/about",
    "/faq",
    "/products",
    ...(getStoreInfo().contact ? ["/contact"] : []),
    ...getShopLinks().links.map((link) => link.href),
    ...getProducts(100).map((product) => `/product/${product.slug}`),
  ];
  const urls = [...new Set(paths)]
    .map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
