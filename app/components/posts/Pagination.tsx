import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/app/components/header/icons";

type Props = {
  /** Path of page 1, e.g. "/category/gut-health"; later pages live at `${basePath}/page/N`. */
  basePath: string;
  current: number;
  total: number;
};

export function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

/** Page numbers to show: always the first, last and neighbours of the current page, with gaps as null. */
function pageNumbers(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? [null, page] : [page]));
}

const itemClass =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors";

/** Previous / numbered / next links for paged listings. Renders nothing for a single page. */
export default function Pagination({ basePath, current, total }: Props) {
  if (total <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {current > 1 && (
        <Link href={pageHref(basePath, current - 1)} rel="prev" className={`${itemClass} gap-1 text-neutral-700 hover:bg-black/5`}>
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Link>
      )}
      <ol className="flex items-center gap-1">
        {pageNumbers(current, total).map((page, i) =>
          page === null ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-neutral-400">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={pageHref(basePath, page)}
                aria-current={page === current ? "page" : undefined}
                aria-label={`Page ${page}`}
                className={`${itemClass} ${
                  page === current
                    ? "bg-[var(--header-brand)] text-white"
                    : "bg-white text-neutral-700 ring-1 ring-black/5 hover:bg-black/5"
                }`}
              >
                {page}
              </Link>
            </li>
          ),
        )}
      </ol>
      {current < total && (
        <Link href={pageHref(basePath, current + 1)} rel="next" className={`${itemClass} gap-1 text-neutral-700 hover:bg-black/5`}>
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
