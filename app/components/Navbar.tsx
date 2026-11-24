import { useState } from "react";
import { Form, Link } from "react-router";
import { ChevronDown, Menu, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export type NavLink = { href: string; label: string };

const linkClass =
  "whitespace-nowrap text-sm font-medium leading-none text-primary transition-colors hover:text-secondary-foreground/70";

// The hover menu stays open while the trigger or a link inside it holds focus; a click on a
// Link clicks drop that focus so the panel closes once the route changes.
const releaseFocus = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

export function Navbar({
  shop,
  extraLinks,
  accountHref,
}: {
  shop: { label: string; links: NavLink[] };
  extraLinks: NavLink[];
  accountHref: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open menu"
          className="-order-1 -ml-2 rounded-full p-2 transition-colors hover:bg-secondary lg:hidden"
        >
          <Menu className="size-6" strokeWidth={1.5} />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="block overflow-y-auto p-0 data-[side=left]:w-[85vw] data-[side=left]:max-w-sm"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Browse the shop
          </SheetDescription>
          <div className="border-b border-border px-5 pb-5 pt-14">
            <Form method="get" action="/search" onSubmit={close}>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  aria-label="Search products"
                  placeholder="Search products"
                  className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>
            </Form>
          </div>
          <nav className="px-5 py-6">
            <Link
              to="/products"
              onClick={close}
              className="block py-2 font-display text-3xl"
            >
              All products
            </Link>
            {shop.links.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {shop.label}
                </h2>
                <ul>
                  {shop.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        onClick={close}
                        className="block py-2 font-display text-2xl"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="mt-8 space-y-1 border-t border-border pt-6">
              {extraLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={close}
                    className="block py-2 text-base font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/faq"
                  onClick={close}
                  className="block py-2 text-base font-medium"
                >
                  Help
                </Link>
              </li>
              <li>
                <a
                  href={accountHref}
                  className="block py-2 text-base font-medium"
                >
                  Account
                </a>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
      <nav
        aria-label="Main"
        className="order-1 mt-1 hidden items-center gap-8 lg:flex"
      >
        <Link to="/products" className={linkClass}>
          Products
        </Link>
        {shop.links.length > 0 && (
          <div className="group relative">
            <button
              type="button"
              aria-haspopup="true"
              className={`${linkClass} flex items-center gap-1 py-2`}
            >
              {shop.label}
              <ChevronDown
                aria-hidden="true"
                className="size-3 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
              />
            </button>
            <div className="invisible absolute top-full left-0 z-50 pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="w-60 border border-border bg-popover py-2 shadow-md">
                {shop.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={releaseFocus}
                      className="block px-6 py-2.5 text-sm transition-colors hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {extraLinks.map((link) => (
          <Link key={link.href} to={link.href} className={linkClass}>
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
