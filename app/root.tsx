import type { Route } from "./+types/root";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import Provider from "~/components/Provider";
import { getShopLinks, getStoreInfo } from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";
import "./assets/css/app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,200..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
  },
];

export function loader({ request }: Route.LoaderArgs) {
  return {
    info: getStoreInfo(),
    shop: getShopLinks(),
    config: getStoreConfig(),
    origin: new URL(request.url).origin,
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const name = loaderData?.info.storeName ?? "Your Next Store";
  const description =
    loaderData?.info.storeDescription ??
    "Considered things for everyday living, in soft colours and simple shapes.";
  const origin = loaderData?.origin ?? "";
  const url = `${origin}/`;

  return [
    { title: name },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: name },
    { property: "og:url", content: url },
    { property: "og:title", content: name },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: name },
    { name: "twitter:description", content: description },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        publisher: { "@type": "Organization", name },
      },
    },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider>{children}</Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { info, shop, config } = loaderData;

  return (
    <div className="flex min-h-screen flex-col">
      <Header info={info} shop={shop} config={config} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer info={info} shop={shop} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
