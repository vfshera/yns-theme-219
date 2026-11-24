import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { CATALOG_SORTS, type CatalogSort } from "~/lib/catalog-sort";
import { cn } from "~/lib/utils";

type ListingControlsProps = {
  categories: { value: string; label: string }[];
  sort: CatalogSort;
  category?: string;
  /** Preserve a search query when the controls are used on /search. */
  query?: string;
  showCategory?: boolean;
};

const fieldClass = cn(
  "h-10 rounded-md border border-input bg-background px-3 text-sm",
  "text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
);

export function ListingControls({
  categories,
  sort,
  category = "",
  query,
  showCategory = true,
}: ListingControlsProps) {
  return (
    <Form method="get" className="mb-6 flex flex-wrap items-center gap-3">
      {query !== undefined && <input type="hidden" name="q" value={query} />}

      {showCategory && categories.length > 0 && (
        <select
          name="category"
          aria-label="Filter by category"
          defaultValue={category}
          className={fieldClass}
        >
          <option value="">All categories</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <select
        name="sort"
        aria-label="Sort products"
        defaultValue={sort}
        className={fieldClass}
      >
        {CATALOG_SORTS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <Button type="submit" size="sm" variant="outline">
        Apply
      </Button>
    </Form>
  );
}
