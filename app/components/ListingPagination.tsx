import { Link } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";

type ListingPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Query parameters other than `page` that must survive navigation. */
  params?: Record<string, string | undefined>;
};

const pageHref = (
  basePath: string,
  page: number,
  params: Record<string, string | undefined>,
) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  if (page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();

  return query ? `${basePath}?${query}` : basePath;
};

const pageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "…")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "…")[] = [1];

  if (currentPage > 3) {
    pages.push("…");
  }
  for (
    let page = Math.max(2, currentPage - 1);
    page <= Math.min(totalPages - 1, currentPage + 1);
    page += 1
  ) {
    pages.push(page);
  }
  if (currentPage < totalPages - 2) {
    pages.push("…");
  }

  pages.push(totalPages);

  return pages;
};

export function ListingPagination({
  basePath,
  currentPage,
  totalPages,
  params = {},
}: ListingPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const linkClass = buttonVariants({ variant: "ghost", size: "icon" });
  const arrow = (direction: "previous" | "next") => {
    const isPrevious = direction === "previous";
    const target = currentPage + (isPrevious ? -1 : 1);
    const enabled = isPrevious ? currentPage > 1 : currentPage < totalPages;

    return (
      <PaginationItem>
        {enabled ? (
          <Link
            to={pageHref(basePath, target, params)}
            aria-label={`Go to ${direction} page`}
            className={linkClass}
          >
            {isPrevious ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-40")}>
            {isPrevious ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </span>
        )}
      </PaginationItem>
    );
  };

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {arrow("previous")}
        {pageNumbers(currentPage, totalPages).map((page, index) =>
          page === "…" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Link
                to={pageHref(basePath, page, params)}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  linkClass,
                  page === currentPage && "bg-secondary text-foreground",
                )}
              >
                {page}
              </Link>
            </PaginationItem>
          ),
        )}
        {arrow("next")}
      </PaginationContent>
    </Pagination>
  );
}
