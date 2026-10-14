import Link from "next/link";
import type { ReactNode } from "react";
import { DocumentIcon } from "@/app/components/header/icons";
import { Pagination } from "@/app/components/posts";
import { listingHref, type ListingFilters as Filters } from "@/app/lib/listing";
import ListingFilters from "./ListingFilters";

type Props = {
  /** Small label above the title, e.g. "Press Releases". */
  eyebrow: string;
  title: string;
  description: string;
  /** Short line under the description, beside a document icon. */
  note?: string;
  /** Path of the listing, e.g. "/news"; the filter form and page links point here. */
  basePath: string;
  /** What's listed, e.g. "press releases"; used in the search box and empty message. */
  noun: string;
  categories: { slug: string; name: string }[];
  filters: Filters;
  /** Whether filters.category matched one of the categories. */
  hasCategory: boolean;
  /** This page's results, or null if WordPress couldn't be reached. */
  results: { count: number; total: number; totalPages: number } | null;
  perPage: number;
  /** Width of the results column. */
  width?: "narrow" | "wide";
  /** The result cards. */
  children: ReactNode;
};

/** Search-and-browse page: centred header, filter bar with a result count, the results, and pagination. */
export default function ListingPage({
  eyebrow,
  title,
  description,
  note,
  basePath,
  noun,
  categories,
  filters,
  hasCategory,
  results,
  perPage,
  width = "narrow",
  children,
}: Props) {
  const isFiltered = Boolean(filters.search || hasCategory);
  const first = (filters.page - 1) * perPage + 1;
  const last = results ? first + results.count - 1 : 0;

  return (
    <main className="flex-1 bg-[var(--header-bg)] font-sans">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:py-16">
          <span className="inline-block rounded-md bg-neutral-200/70 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 text-base text-neutral-600 sm:text-lg">{description}</p>
          {note && (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <DocumentIcon className="h-4 w-4" />
              {note}
            </p>
          )}
        </div>
      </header>

      <div
        className={`mx-auto flex flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 ${
          width === "wide" ? "max-w-7xl" : "max-w-5xl"
        }`}
      >
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-6">
          {/* Keyed so the fields reset to the URL's values after back/forward navigation */}
          <ListingFilters
            key={listingHref(basePath, filters)}
            action={basePath}
            noun={noun}
            categories={categories}
            search={filters.search}
            category={hasCategory ? filters.category : ""}
            sort={filters.sort}
          />
          {results && (
            <p aria-live="polite" className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              {results.total === 0
                ? "No results"
                : `Showing ${first}–${last} of ${results.total} ${results.total === 1 ? "result" : "results"}`}
            </p>
          )}
        </div>

        {!results ? (
          <p role="alert" className="rounded-2xl bg-red-50 p-8 text-center font-semibold text-red-700">
            Sorry, {noun} are unavailable right now. Please try again in a few minutes.
          </p>
        ) : results.count === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-sm ring-1 ring-black/5">
            <p>{isFiltered ? `No ${noun} match your search.` : `No ${noun} have been published yet.`}</p>
            {isFiltered && (
              <Link
                href={basePath}
                className="mt-3 inline-block font-semibold text-[var(--header-brand)] underline-offset-4 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          children
        )}

        {results && (
          <div className="pt-4">
            <Pagination
              basePath={basePath}
              current={filters.page}
              total={results.totalPages}
              href={(page) => listingHref(basePath, { ...filters, page })}
            />
          </div>
        )}
      </div>
    </main>
  );
}
