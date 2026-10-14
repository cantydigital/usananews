import Link from "next/link";
import { useId } from "react";
import { ChevronRightIcon } from "@/app/components/header/icons";
import PressReleaseListItem from "@/app/components/press-release/PressReleaseListItem";
import type { PressReleaseSummary } from "@/app/lib/wordpress";

type Props = {
  releases: PressReleaseSummary[];
  title?: string;
  subtitle?: string;
  /** Shows a "View All Press Releases" button when set. */
  viewAllHref?: string;
};

/** Centred heading over a single column of horizontal press release cards. Renders nothing when there are none. */
export default function RecentPressReleases({
  releases,
  title = "Recent Press Releases",
  subtitle = "Stay updated with the latest news and announcements",
  viewAllHref,
}: Props) {
  const headingId = useId();
  if (releases.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="w-full font-sans">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="text-center">
          <h2 id={headingId} className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-neutral-600">{subtitle}</p>
        </header>

        <ul className="mt-10 flex flex-col gap-5">
          {releases.map((release) => (
            <li key={release.href}>
              <PressReleaseListItem release={release} />
            </li>
          ))}
        </ul>

        {viewAllHref && (
          <div className="mt-8 flex justify-center">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-black/10 transition hover:bg-[var(--header-brand)] hover:text-white"
            >
              View All Press Releases
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
