"use client";

import { ChevronUpIcon } from "@/app/components/header/icons";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--header-brand)] text-white shadow-sm ring-4 ring-[var(--header-bg)] transition hover:brightness-110"
    >
      <ChevronUpIcon className="h-6 w-6" />
    </button>
  );
}
