"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PostCard } from "@/app/components/posts";
import type { PostSummary } from "@/app/lib/wordpress";
import { CloseIcon, SearchIcon } from "./icons";

type Props = {
  /** Classes for the header's search icon button. */
  buttonClassName?: string;
};

type Results =
  | { status: "idle" }
  | { status: "loading"; term: string }
  | { status: "done"; term: string; posts: PostSummary[] }
  | { status: "error"; term: string };

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

/** Search icon that opens a popup with live article suggestions as you type. */
export default function SearchDialog({ buttonClassName = "" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ status: "idle" });
  const pathname = usePathname();
  const id = useId();
  const term = query.trim();

  const open = () => {
    dialogRef.current?.showModal();
    // Stop the page behind from scrolling while the popup is open.
    document.documentElement.classList.add("overflow-hidden");
  };
  const close = () => dialogRef.current?.close();

  // Close when a suggestion navigates to another page.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Fetch suggestions once typing pauses; a newer search cancels the one in flight.
  useEffect(() => {
    if (term.length < MIN_LENGTH) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResults({ status: "loading", term });
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const body = (await res.json()) as { posts: PostSummary[] };
        setResults(res.ok ? { status: "done", term, posts: body.posts } : { status: "error", term });
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults({ status: "error", term });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Results for an older or too-short query aren't shown.
  const current = term.length >= MIN_LENGTH && results.status !== "idle" && results.term === term ? results : null;

  return (
    <>
      <button type="button" onClick={open} aria-label="Search" aria-haspopup="dialog" className={buttonClassName}>
        <SearchIcon className="h-6 w-6" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-label`}
        // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
        onClick={(event) => event.target === dialogRef.current && close()}
        // Fires however it closes: Esc, backdrop, the close button or navigating to a result.
        onClose={() => document.documentElement.classList.remove("overflow-hidden")}
        className="m-auto mt-[8vh] max-h-[84vh] w-[calc(100%-2rem)] max-w-5xl overflow-hidden rounded-2xl bg-[var(--header-bg)] p-0 font-sans text-neutral-900 shadow-2xl backdrop:bg-[#2b2248]/60 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6"
        >
          <label id={`${id}-label`} htmlFor={`${id}-input`} className="sr-only">
            Search articles
          </label>
          <SearchIcon className="h-6 w-6 shrink-0 text-[var(--header-brand)]" />
          <input
            id={`${id}-input`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            // Search fields clear themselves on the first Esc; close the popup straight away instead.
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
            placeholder="Search articles…"
            autoComplete="off"
            autoFocus
            maxLength={100}
            aria-controls={`${id}-results`}
            className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-black/5 hover:text-black"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </form>

        <div id={`${id}-results`} aria-live="polite" className="overflow-y-auto px-4 py-6 sm:px-6">
          {!current && (
            <p className="py-6 text-center text-sm text-neutral-500">
              {term.length < MIN_LENGTH ? "Start typing to search articles." : "Searching…"}
            </p>
          )}
          {current?.status === "loading" && <p className="py-6 text-center text-sm text-neutral-500">Searching…</p>}
          {current?.status === "error" && (
            <p className="py-6 text-center text-sm text-red-600">Search isn&apos;t available right now. Please try again.</p>
          )}
          {current?.status === "done" &&
            (current.posts.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-600">
                No articles found for <strong className="text-neutral-900">&ldquo;{current.term}&rdquo;</strong>.
              </p>
            ) : (
              <>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Suggested articles
                </p>
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {current.posts.map((post) => (
                    <PostCard key={post.href} post={post} sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" />
                  ))}
                </div>
              </>
            ))}
        </div>
      </dialog>
    </>
  );
}
