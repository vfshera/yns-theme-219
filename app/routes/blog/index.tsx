import type { Route } from "./+types/index";
import { data, Link } from "react-router";
import { YnsMedia } from "~/components/YnsMedia";
import { formatDate } from "~/lib/format-date";
import { getPosts, getStoreInfo } from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";

export function loader() {
  const info = getStoreInfo();
  if (!info.blog) {
    throw data(null, { status: 404 });
  }

  return {
    posts: getPosts(24),
    info,
    locale: getStoreConfig().locale,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const storeName = loaderData?.info.storeName ?? "Your Next Store";
  const description = `News, guides, and stories from ${storeName}.`;
  const origin = matches[0]?.loaderData?.origin ?? "http://localhost:5173";
  const url = `${origin}${location.pathname}`;
  const title = `Blog | ${storeName}`;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { posts, info, locale } = loaderData;

  return (
    <div className="layout py-12 sm:py-16">
      <div className="mb-10">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>Blog</span>
        </nav>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          News, guides, and stories from {info.storeName}.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-border bg-secondary/30 p-12 text-center">
          <h2 className="text-xl font-medium tracking-tight">No posts yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon for new articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <div className="mb-4 relative aspect-[3/2] overflow-hidden rounded-2xl bg-secondary">
                {post.image && (
                  <YnsMedia
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.tag && (
                    <span className="rounded-full bg-secondary px-3 py-1 font-medium text-foreground">
                      {post.tag}
                    </span>
                  )}
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt, locale)}
                    </time>
                  )}
                </div>
                <h2 className="text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-foreground/70">
                  {post.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
