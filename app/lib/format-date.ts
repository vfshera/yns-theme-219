/** Universal date formatter for editorial pages (blog posts, etc.). */
export function formatDate(value: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
