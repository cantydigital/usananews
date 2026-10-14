import Image from "next/image";
import Link from "next/link";
import { BuildingIcon, CalendarIcon, ChevronRightIcon, UserIcon } from "@/app/components/header/icons";
import { formatDate } from "@/app/components/posts";
import type { PressReleaseSummary } from "@/app/lib/wordpress";

type Props = {
  release: PressReleaseSummary;
  readMoreLabel?: string;
  /** Heading level, so the card fits the page's outline. */
  headingLevel?: "h2" | "h3";
  priority?: boolean;
};

/** Horizontal press release card: image on the left (on top on mobile), details on the right. */
export default function PressReleaseListItem({
  release,
  readMoreLabel = "Read More",
  headingLevel: Heading = "h3",
  priority,
}: Props) {
  return (
    <article className="group relative flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 transition hover:shadow-md sm:flex-row sm:p-6">
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-44 sm:self-start">
        {release.image ? (
          <Image
            src={release.image.url}
            alt={release.image.alt}
            fill
            sizes="(min-width: 640px) 176px, 100vw"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#7a68b5_0%,var(--header-brand)_45%,#2b2248_100%)]"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        {release.category && (
          <span className="self-start rounded-md px-2 py-0.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-300">
            {release.category}
          </span>
        )}

        <Heading className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-neutral-900">
          <Link href={release.href} className="underline-offset-4 group-hover:underline">
            {/* Stretch the link so the whole card is clickable */}
            <span aria-hidden className="absolute inset-0" />
            {release.title}
          </Link>
        </Heading>

        {release.subtitle && <p className="mt-1 line-clamp-1 text-sm text-neutral-600">{release.subtitle}</p>}

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <time dateTime={release.date}>{formatDate(release.date)}</time>
          </span>
          {release.company && (
            <span className="flex items-center gap-1.5">
              <BuildingIcon className="h-3.5 w-3.5" />
              {release.company}
            </span>
          )}
          {release.contactName && (
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              {release.contactName}
            </span>
          )}
        </p>

        {release.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">{release.excerpt}</p>
        )}

        <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--header-brand)]">
          {readMoreLabel}
          <ChevronRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
