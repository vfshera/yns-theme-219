/** Sort options shared by listing loaders and the controls rendered on every listing route. */
export type CatalogSort = "featured" | "name" | "price-asc" | "price-desc";

export const CATALOG_SORTS: { value: CatalogSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function parseSort(raw: string | null): CatalogSort {
  return (
    CATALOG_SORTS.find((option) => option.value === raw)?.value ?? "featured"
  );
}
