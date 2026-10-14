import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { CalendarIcon, ChevronRightIcon } from "@/app/components/header/icons";
import { formatDate } from "@/app/components/posts";
import type { PressReleaseSummary } from "@/app/lib/wordpress";

type Props = {
  releases: PressReleaseSummary[];
  title?: string;
  subtitle?: string;
};

/** Centred "Featured" heading over a row of press release cards. Renders nothing when there are none. */
export default function FeaturedPressReleases({
  releases,
  title = "Latest Featured Press Releases",
  subtitle = "Breaking news and important announcements from leading organisations",
}: Props) {
  const headingId = useId();
  if (releases.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="w-full font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-md bg-neutral-200/70 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            Featured
          </span>
          <h2 id={headingId} className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-neutral-600">{subtitle}</p>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <PressReleaseCard key={release.href} release={release} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PressReleaseCard({ release }: { release: PressReleaseSummary }) {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/10 transition hover:shadow-md">
      <div className="relative aspect-[5/3] overflow-hidden rounded-xl bg-neutral-100">
        {release.image ? (
          <Image
            src={release.image.url}
            alt={release.image.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#7a68b5_0%,var(--header-brand)_45%,#2b2248_100%)]"
          />
        )}
      </div>

      {release.category && (
        <span className="mt-5 self-start rounded-md px-2 py-0.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-300">
          {release.category}
        </span>
      )}

      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-neutral-900">
        <Link href={release.href} className="underline-offset-4 group-hover:underline">
          {/* Stretch the link so the whole card is clickable */}
          <span aria-hidden className="absolute inset-0" />
          {release.title}
        </Link>
      </h3>

      {release.subtitle && <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{release.subtitle}</p>}

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          <time dateTime={release.date}>{formatDate(release.date)}</time>
        </span>
        {release.company && (
          <>
            <span aria-hidden>•</span>
            <span>{release.company}</span>
          </>
        )}
      </p>

      {release.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">{release.excerpt}</p>}

      <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-[var(--header-brand)]">
        Read Full Release
        <ChevronRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}
