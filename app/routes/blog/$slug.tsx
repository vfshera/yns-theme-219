import type { Route } from "./+types/$slug";
import { data, Link } from "react-router";
import {
  TiptapRenderer,
  type TiptapNodeMapping,
} from "~/components/TiptapRenderer";
import { YnsMedia } from "~/components/YnsMedia";
import { formatDate } from "~/lib/format-date";
import {
  getPostBySlug,
  getProductById,
  getStoreInfo,
} from "~/lib/mock-store/catalog.server";
import { getStoreConfig } from "~/lib/mock-store/config.server";
import { BlogProductEmbed } from "./+/BlogProductEmbed";
import type { JSONContent } from "@tiptap/core";

/** The static renderer's Youtube markup uses non-React props; render a clean iframe instead. */
const youtubeEmbedUrl = (src: string): string => {
  try {
    const url = new URL(src);
    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${url.pathname}`;
    }

    if (url.pathname.startsWith("/embed/")) {
      return src;
    }

    const videoId = url.searchParams.get("v");

    return videoId ? `https://www.youtube.com/embed/${videoId}` : src;
  } catch {
    return src;
  }
};

const collectProductIds = (node: JSONContent, ids: Set<string>): void => {
  if (node.type === "productEmbed" && Array.isArray(node.attrs?.productIds)) {
    for (const id of node.attrs.productIds) {
      if (typeof id === "string") {
        ids.add(id);
      }
    }
  }

  for (const child of node.content ?? []) {
    collectProductIds(child, ids);
  }
};

export function loader({ params }: Route.LoaderArgs) {
  const info = getStoreInfo();
  if (!info.blog) {
    throw data(null, { status: 404 });
  }

  const post = getPostBySlug(params.slug);
  if (!post) {
    throw data(null, { status: 404 });
  }

  const config = getStoreConfig();
  const ids = new Set<string>();
  if (post.content) {
    collectProductIds(post.content, ids);
  }

  const embedProducts = [...ids]
    .map(getProductById)
    .filter(
      (product): product is NonNullable<typeof product> => product !== null,
    );

  return { post, info, config, locale: config.locale, embedProducts };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const post = loaderData?.post;
  const storeName = loaderData?.info.storeName ?? "Your Next Store";
  const seoTitle = post?.seo?.title || post?.title || "Post Not Found";
  const description =
    post?.seo?.description ??
    (post ? `Read ${post.title} on ${storeName}.` : "Blog post not found.");
  const origin = matches[0]?.loaderData?.origin ?? "http://localhost:5173";
  const canonical =
    post?.seo?.canonical ?? (post ? `/blog/${post.slug}` : location.pathname);
  const url = `${origin}${canonical}`;
  const title = `${seoTitle} | ${storeName}`;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(post?.image
      ? [{ property: "og:image", content: `${origin}${post.image}` }]
      : []),
    {
      name: "twitter:card",
      content: post?.image ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(post?.image
      ? [{ name: "twitter:image", content: `${origin}${post.image}` }]
      : []),
  ];
};

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, config, locale, embedProducts } = loaderData;
  const publishedAt = post.publishedAt ?? post.createdAt;

  const nodeMapping: TiptapNodeMapping = {
    youtube: ({ node }) => {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!src) {
        return null;
      }

      return (
        <div className="not-prose my-8 aspect-video overflow-hidden rounded-lg bg-secondary">
          <iframe
            className="size-full"
            src={youtubeEmbedUrl(src)}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    },
    productEmbed: ({ node }) => {
      const rawIds = node.attrs?.productIds;
      const productIds = Array.isArray(rawIds)
        ? rawIds.filter((id): id is string => typeof id === "string")
        : [];
      const variantIds: Record<string, string> = {};
      const rawVariants = node.attrs?.variantIds;

      if (rawVariants && typeof rawVariants === "object") {
        for (const [key, value] of Object.entries(rawVariants)) {
          if (typeof value === "string") {
            variantIds[key] = value;
          }
        }
      }

      return (
        <BlogProductEmbed
          productIds={productIds}
          variantIds={variantIds}
          products={embedProducts}
          config={config}
        />
      );
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link
            to="/blog"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="line-clamp-1">{post.title}</span>
        </nav>
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          {post.tag && (
            <span className="rounded-full bg-secondary px-3 py-1 font-medium text-foreground">
              {post.tag}
            </span>
          )}
          <time dateTime={publishedAt}>{formatDate(publishedAt, locale)}</time>
        </div>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-balance">
          {post.title}
        </h1>
      </div>

      {post.image && (
        <div className="relative mb-10 aspect-[3/2] overflow-hidden rounded-2xl bg-secondary">
          <YnsMedia
            src={post.image}
            alt={post.title}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-sm tiptap-content max-w-none">
        <TiptapRenderer content={post.content} nodeMapping={nodeMapping} />
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <Link
          to="/blog"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to blog
        </Link>
      </div>
    </article>
  );
}
