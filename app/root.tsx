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

export function loader() {
  return {
    info: getStoreInfo(),
    shop: getShopLinks(),
    config: getStoreConfig(),
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.info.storeName ?? "Your Next Store" },
];

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
