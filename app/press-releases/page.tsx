import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentIcon } from "@/app/components/header/icons";
import { Pagination } from "@/app/components/posts";
import PressReleaseFilters from "@/app/components/press-release/PressReleaseFilters";
import PressReleaseListItem from "@/app/components/press-release/PressReleaseListItem";
import {
  getPressReleaseListing,
  getSubmissionCategories,
  type PressReleaseListing,
  type PressReleaseSort,
} from "@/app/lib/wordpress";

const BASE_PATH = "/press-releases";
const PER_PAGE = 10;
const SORTS: PressReleaseSort[] = ["newest", "oldest", "title"];

type Filters = { search: string; category: string; sort: PressReleaseSort; page: number };

/** Reads ?q=&category=&sort=&page= leniently: anything invalid falls back to its default. */
function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const sort = first(params.sort) as PressReleaseSort;
  const page = Number.parseInt(first(params.page), 10);
  return {
    search: first(params.q).slice(0, 100),
    category: first(params.category),
    sort: SORTS.includes(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Listing URL for these filters, leaving out defaults so links stay short, e.g. "/press-releases?page=2". */
function listingHref({ search, category, sort, page }: Filters) {
  const query = new URLSearchParams({
    ...(search && { q: search }),
    ...(category && { category }),
    ...(sort !== "newest" && { sort }),
    ...(page > 1 && { page: String(page) }),
  }).toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export async function generateMetadata({ searchParams }: PageProps<"/press-releases">): Promise<Metadata> {
  const { page } = parseFilters(await searchParams);
  return {
    title: page > 1 ? `All Press Releases – Page ${page}` : "All Press Releases",
    description:
      "Browse all published press releases from businesses, organisations and agencies across Australia.",
  };
}

export default async function PressReleasesPage({ searchParams }: PageProps<"/press-releases">) {
  const filters = parseFilters(await searchParams);
  const categories = await getSubmissionCategories().catch((error: Error) => {
    console.warn("Press release category filter unavailable:", error.message);
    return [];
  });
  const categoryId = categories.find((c) => c.slug === filters.category)?.id;

  const listing: PressReleaseListing | null = await getPressReleaseListing({
    page: filters.page,
    perPage: PER_PAGE,
    search: filters.search || undefined,
    categoryId,
    sort: filters.sort,
  }).catch((error: Error) => {
    console.error("Press releases unavailable:", error.message);
    return null;
  });

  // A page past the end, e.g. from an old link after releases were removed.
  if (listing && listing.releases.length === 0 && filters.page > 1) notFound();

  const isFiltered = Boolean(filters.search || categoryId);
  const first = (filters.page - 1) * PER_PAGE + 1;
  const last = listing ? first + listing.releases.length - 1 : 0;

  return (
    <main className="flex-1 bg-[var(--header-bg)] font-sans">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:py-16">
          <span className="inline-block rounded-md bg-neutral-200/70 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            Press Releases
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            All Press Releases
          </h1>
          <p className="mt-4 text-base text-neutral-600 sm:text-lg">
            Browse all published press releases from businesses, organisations and agencies across Australia. Stay
            updated with the latest news and announcements.
          </p>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-500">
            <DocumentIcon className="h-4 w-4" />
            Latest press releases from trusted sources
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-6">
          {/* Keyed so the fields reset to the URL's values after back/forward navigation */}
          <PressReleaseFilters
            key={listingHref(filters)}
            action={BASE_PATH}
            categories={categories}
            search={filters.search}
            category={categoryId ? filters.category : ""}
            sort={filters.sort}
          />
          {listing && (
            <p aria-live="polite" className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              {listing.total === 0
                ? "No results"
                : `Showing ${first}–${last} of ${listing.total} ${listing.total === 1 ? "result" : "results"}`}
            </p>
          )}
        </div>

        {!listing ? (
          <p role="alert" className="rounded-2xl bg-red-50 p-8 text-center font-semibold text-red-700">
            Sorry, press releases are unavailable right now. Please try again in a few minutes.
          </p>
        ) : listing.releases.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-sm ring-1 ring-black/5">
            <p>{isFiltered ? "No press releases match your search." : "No press releases have been published yet."}</p>
            {isFiltered && (
              <Link
                href={BASE_PATH}
                className="mt-3 inline-block font-semibold text-[var(--header-brand)] underline-offset-4 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {listing.releases.map((release, i) => (
              <li key={release.href}>
                <PressReleaseListItem
                  release={release}
                  readMoreLabel="Read Full Release"
                  headingLevel="h2"
                  priority={i < 2}
                />
              </li>
            ))}
          </ul>
        )}

        {listing && (
          <div className="pt-4">
            <Pagination
              basePath={BASE_PATH}
              current={filters.page}
              total={listing.totalPages}
              href={(page) => listingHref({ ...filters, page })}
            />
          </div>
        )}
      </div>
    </main>
  );
}
