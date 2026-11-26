import type { Route } from "./+types/about";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { YnsMedia } from "~/components/YnsMedia";
import { getStoreInfo } from "~/lib/mock-store/catalog.server";
import { ABOUT_IMAGE } from "~/lib/mock-store/editorial.server";

const values = [
  {
    title: "Chosen with care",
    body: "A short, considered range rather than an endless one: each piece earns its place.",
  },
  {
    title: "Made to be used",
    body: "Things that look good on the shelf and work just as well every day.",
  },
  {
    title: "Here to help",
    body: "Questions before or after an order? Get in touch and we will gladly help.",
  },
];

export function loader() {
  return {
    info: getStoreInfo(),
    image: ABOUT_IMAGE,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, location }) => {
  const { storeName, storeDescription } = loaderData.info;
  const origin = matches[0].loaderData.origin;
  const url = `${origin}${location.pathname}`;
  const description = storeDescription
    ? `Learn more about ${storeName}. ${storeDescription}`
    : `Learn about ${storeName} — our story, our values, and the people behind the products.`;
  const ogImage = `${origin}${loaderData.image}`;

  return [
    { title: `About Us | ${storeName}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: `About Us | ${storeName}` },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `About Us | ${storeName}` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
};

export default function About({ loaderData }: Route.ComponentProps) {
  const { info, image } = loaderData;

  return (
    <div className="layout pt-6 pb-24">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span>About</span>
      </nav>

      <section className="mb-16 grid overflow-hidden rounded-lg bg-pastel-2 lg:mb-20 lg:h-[450px] lg:grid-cols-12">
        <div className="flex items-center px-6 py-12 sm:px-10 lg:col-span-7 lg:pl-20">
          <div>
            <h1 className="mb-4 font-display text-[2.5rem] leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
              About {info.storeName}
            </h1>
            <p className="mb-8 max-w-md text-primary">
              {info.storeDescription ??
                "A small shop with a simple idea: fewer, better things for everyday life."}
            </p>
            <Link
              to="/products"
              className="btn-shimmer inline-flex h-11 w-max items-center gap-2 rounded-full bg-primary px-8 font-display text-lg font-light text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Shop products
              <ArrowRight
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
        <div className="relative min-h-64 sm:min-h-80 lg:col-span-5 lg:min-h-0">
          <YnsMedia
            src={image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mb-16 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:gap-10">
        <h2 className="text-2xl font-medium lg:col-span-4">Our story</h2>
        <div className="space-y-4 leading-relaxed text-primary lg:col-span-7">
          <p>
            We started {info.storeName} because we wanted a shop we would enjoy
            browsing ourselves: clear, calm and easy to find your way around,
            with every product shown as it really is.
          </p>
          <p>
            We keep the range focused, so every product is worth a closer look
            and easy to compare with the rest.
          </p>
        </div>
      </section>

      <section aria-labelledby="about-values" className="mb-16 lg:mb-20">
        <h2 id="about-values" className="mb-6 text-2xl font-medium">
          What we stand for
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <li
              key={value.title}
              className="rounded-lg bg-secondary p-6 lg:p-8"
            >
              <h3 className="mb-2 font-display text-2xl">{value.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {value.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 border-t border-border pt-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-medium">Want to learn more?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse the shop, or get in touch: we would love to hear from you.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className="btn-shimmer inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Shop products
          </Link>
          <Link
            to={info.contact ? "/contact" : "/faq"}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            {info.contact ? "Contact us" : "Read the FAQ"}
          </Link>
        </div>
      </section>
    </div>
  );
}
