import type { ReactNode } from "react";
import { Link } from "react-router";
import { FooterNewsletter } from "~/components/FooterNewsletter";

// The source pins this to a cache entry; a module constant keeps it out of render.
const COPYRIGHT_YEAR = new Date().getFullYear();

type NavLink = { href: string; label: string };

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-5 text-lg font-semibold text-primary">{title}</h2>
      {children}
    </div>
  );
}

const footerLink =
  "w-max max-w-full text-base text-primary hover:underline hover:underline-offset-2";

function LinkList({ links }: { links: NavLink[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link to={link.href} className={footerLink}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer({
  info,
  shop,
  legal,
}: {
  info: {
    storeName: string;
    blog: boolean;
    contact: boolean;
    newsletter: boolean;
    socialLinks: { label: string; href: string }[];
  };
  shop: { label: string; links: NavLink[] };
  legal: NavLink[];
}) {
  const year = COPYRIGHT_YEAR;
  const browse = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All products" },
    { href: "/about", label: "About" },
    ...(info.blog ? [{ href: "/blog", label: "Blog" }] : []),
  ];
  const help = [
    ...(info.contact ? [{ href: "/contact", label: "Contact" }] : []),
    { href: "/faq", label: "FAQs" },
    ...legal,
  ];

  return (
    <footer className="w-full border-t border-secondary-foreground/10 bg-secondary py-14 lg:py-20">
      <div className="layout grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="col-span-2 flex flex-col lg:col-span-4 lg:pr-10">
          <h2 className="mb-5 text-2xl font-medium uppercase">
            {info.storeName} news
          </h2>
          <p className="mb-5 text-primary">
            Stay up to date with everything new at {info.storeName}, from fresh
            arrivals to the occasional offer.
          </p>
          {info.newsletter && <FooterNewsletter />}
          {info.socialLinks.length > 0 && (
            <FooterColumn title="Follow us" className="mb-10">
              <ul className="flex flex-wrap items-center gap-3">
                {info.socialLinks.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 items-center justify-center rounded-full bg-secondary-foreground/10 px-5 text-sm font-medium transition-colors hover:bg-secondary-foreground/20"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          )}
          <p className="hidden text-primary lg:block">
            &copy; {year} {info.storeName}, all rights reserved.
          </p>
        </div>
        <FooterColumn title="Browse" className="lg:col-span-2">
          <LinkList links={browse} />
        </FooterColumn>
        {shop.links.length > 0 && (
          <FooterColumn title="Shop" className="lg:col-span-2">
            <LinkList links={shop.links} />
          </FooterColumn>
        )}
        <FooterColumn title="Help and guide" className="lg:col-span-2">
          <LinkList links={help} />
        </FooterColumn>
        <p className="col-span-2 text-primary lg:hidden">
          &copy; {year} {info.storeName}, all rights reserved.
        </p>
      </div>
    </footer>
  );
}
