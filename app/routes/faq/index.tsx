import type { Route } from "./+types/index";
import { Link } from "react-router";
import { Mail } from "lucide-react";
import { faqCategories } from "./+/faq-data";
import { FaqAccordion } from "./+/FaqAccordion";

export const meta: Route.MetaFunction = ({ matches, location }) => {
  const { storeName, storeDescription } = matches[0].loaderData.info;
  const origin = matches[0].loaderData.origin;
  const url = `${origin}${location.pathname}`;
  const description =
    storeDescription ?? `Answers to common questions about ${storeName}.`;

  return [
    { title: `FAQ | ${storeName}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeName },
    { property: "og:url", content: url },
    { property: "og:title", content: `FAQ | ${storeName}` },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `FAQ | ${storeName}` },
    { name: "twitter:description", content: description },
  ];
};

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>FAQ</span>
        </nav>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Find answers to the most common questions about your orders, payments,
          shipping, and more.
        </p>
      </header>

      <nav aria-label="FAQ categories" className="mb-10 flex flex-wrap gap-2">
        {faqCategories.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {category.title}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {faqCategories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-medium tracking-tight">
              {category.title}
            </h2>
            <FaqAccordion category={category} />
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-lg border border-border bg-secondary/30 p-8 text-center">
        <h2 className="text-2xl font-medium tracking-tight">
          Still have questions?
        </h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;re here to help. Reach out and we&apos;ll get back to you as
          soon as possible.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          <Mail className="size-4" aria-hidden="true" />
          <span>Contact us via the details on our website</span>
        </p>
      </section>
    </div>
  );
}
