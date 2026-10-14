"use client";

import Form from "next/form";
import type { ChangeEvent } from "react";
import { FilterIcon, SearchIcon } from "@/app/components/header/icons";
import type { PressReleaseSort } from "@/app/lib/wordpress";

type Props = {
  /** Listing page path the form submits to. */
  action: string;
  categories: { slug: string; name: string }[];
  search: string;
  category: string;
  sort: PressReleaseSort;
};

const sortOptions: { value: PressReleaseSort; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title (A–Z)" },
];

const fieldClass =
  "h-10 rounded-lg bg-white text-sm text-neutral-900 ring-1 ring-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-[var(--header-brand)]";

/** Search box plus category and sort menus. A GET form, so it works without JavaScript; menus apply on change. */
export default function PressReleaseFilters({ action, categories, search, category, sort }: Props) {
  const submit = (event: ChangeEvent<HTMLSelectElement>) => event.currentTarget.form?.requestSubmit();

  return (
    <Form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Search press releases</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search press releases…"
          className={`${fieldClass} w-full pl-9 pr-3 placeholder:text-neutral-400`}
        />
      </label>

      <div className="flex items-center gap-3">
        <FilterIcon className="hidden h-4 w-4 shrink-0 text-neutral-500 sm:block" />
        <label className="flex-1 sm:flex-none">
          <span className="sr-only">Category</span>
          <select name="category" defaultValue={category} onChange={submit} className={`${fieldClass} w-full px-3 sm:w-44`}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 sm:flex-none">
          <span className="sr-only">Sort by</span>
          <select name="sort" defaultValue={sort} onChange={submit} className={`${fieldClass} w-full px-3 sm:w-36`}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Enter submits the search; this button is for keyboard and no-JavaScript users */}
      <button type="submit" className="sr-only focus:not-sr-only">
        Search
      </button>
    </Form>
  );
}
