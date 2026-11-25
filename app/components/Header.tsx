import { Link } from "react-router";
import { CartButton } from "~/components/cart";
import { Navbar } from "~/components/Navbar";
import { SearchInput } from "~/components/SearchInput";

type NavLink = { href: string; label: string };

export function Header({
  info,
  shop,
  config,
}: {
  info: { storeName: string; freeShipping: string | null; blog: boolean };
  shop: { label: string; links: NavLink[] };
  config: { language: string | null };
}) {
  // /account is a proxied zone — a plain <a> avoids soft-navigation failures.
  const accountHref = config.language
    ? `/account?lang=${encodeURIComponent(config.language)}`
    : "/account";
  const extraLinks = [
    { href: "/about", label: "About" },
    ...(info.blog ? [{ href: "/blog", label: "Blog" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-secondary">
        <div className="layout flex items-center justify-between gap-4 py-2 text-sm">
          <p className="truncate text-muted-foreground">
            {info.freeShipping ? (
              <>
                Free shipping{" "}
                <span className="hidden sm:inline">on orders </span>over{" "}
                {info.freeShipping}
              </>
            ) : null}
          </p>
          <div className="flex shrink-0 items-center divide-x divide-foreground/30 leading-none">
            <Link
              to="/faq"
              className="px-3 hover:underline hover:underline-offset-2"
            >
              Help
            </Link>
            <a
              href={accountHref}
              className="pl-3 hover:underline hover:underline-offset-2"
            >
              Account
            </a>
          </div>
        </div>
      </div>
      <div className="border-b border-border bg-background py-3 lg:py-4">
        <div className="layout flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 lg:gap-16 xl:gap-24">
            <Navbar
              shop={shop}
              extraLinks={extraLinks}
              accountHref={accountHref}
            />
            <Link
              to="/"
              className="truncate font-display text-[1.65rem] uppercase leading-none tracking-normal"
            >
              {info.storeName}
            </Link>
          </div>
          <div className="flex min-h-11 shrink-0 items-center gap-1 lg:gap-6">
            <SearchInput />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
