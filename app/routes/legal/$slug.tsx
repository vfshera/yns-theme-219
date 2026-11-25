import type { Route } from "./+types/$slug";
import { data, Link } from "react-router";
import {
  getLegalPageBySlug,
  getStoreInfo,
} from "~/lib/mock-store/catalog.server";
import { MarkdownContent } from "./+/MarkdownContent";

export function loader({ params }: Route.LoaderArgs) {
  const page = getLegalPageBySlug(params.slug);
  if (!page) {
    throw data(null, { status: 404 });
  }

  return { page, info: getStoreInfo() };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const page = loaderData?.page;
  const storeName = loaderData?.info.storeName ?? "Your Next Store";
  const label = page?.label ?? "Page Not Found";
  const description = `Read the ${label} for ${storeName}.`;
  const origin = matches[0]?.loaderData?.origin ?? "http://localhost:5173";
  const url = page
    ? `${origin}/legal${page.href}`
    : `${origin}${location.pathname}`;
  const title = `${label} | ${storeName}`;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function LegalPage({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>{page.label}</span>
      </nav>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{page.label}</h1>
      {page.contentMarkdown.trim() ? (
        <div className="prose prose-sm max-w-none">
          <MarkdownContent source={page.contentMarkdown} />
        </div>
      ) : (
        <p className="text-muted-foreground">No content available.</p>
      )}
    </div>
  );
}
