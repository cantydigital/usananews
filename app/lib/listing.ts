import type { ListingSort } from "./wordpress";

/** Search, filter and page of a listing page (News, Press Releases), as kept in its URL. */
export type ListingFilters = { search: string; category: string; sort: ListingSort; page: number };

const SORTS: ListingSort[] = ["newest", "oldest", "title"];

/** Reads ?q=&category=&sort=&page= leniently: anything invalid falls back to its default. */
export function parseListingFilters(params: Record<string, string | string[] | undefined>): ListingFilters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const sort = first(params.sort) as ListingSort;
  const page = Number.parseInt(first(params.page), 10);
  return {
    search: first(params.q).slice(0, 100),
    category: first(params.category),
    sort: SORTS.includes(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Listing URL for these filters, leaving out defaults so links stay short, e.g. "/news?page=2". */
export function listingHref(basePath: string, { search, category, sort, page }: ListingFilters) {
  const query = new URLSearchParams({
    ...(search && { q: search }),
    ...(category && { category }),
    ...(sort !== "newest" && { sort }),
    ...(page > 1 && { page: String(page) }),
  }).toString();
  return query ? `${basePath}?${query}` : basePath;
}
