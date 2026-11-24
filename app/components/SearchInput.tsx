import { Form } from "react-router";
import { Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

/** Static search field: suggestions and live results are deferred with the /search route. */
export function SearchInput() {
  return (
    <>
      {/* Below lg — icon trigger opens a popover with the same form. */}
      <Popover>
        <PopoverTrigger
          aria-label="Search"
          className="inline-flex rounded-full p-2 transition-colors hover:bg-secondary lg:hidden"
        >
          <Search className="size-6" strokeWidth={1.5} />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border-border bg-popover p-2 shadow-lg"
        >
          <Form method="get" action="/search">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                aria-label="Search products"
                placeholder="Search products"
                autoComplete="off"
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          </Form>
        </PopoverContent>
      </Popover>

      {/* Lg+ — the original's grey pill search bar. */}
      <Form method="get" action="/search" className="hidden lg:block">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            aria-label="Search products"
            placeholder="Search products"
            autoComplete="off"
            className="h-11 w-56 rounded-full border-0 bg-secondary pl-11 pr-4 text-base font-medium text-foreground transition-colors placeholder:text-muted-foreground hover:bg-secondary-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 xl:w-64"
          />
        </div>
      </Form>
    </>
  );
}
