import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/app/components/header/icons";

type Props = {
  title: string;
  /** Shows a "View All" link when set. */
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Custom content on the right, e.g. tabs. Replaces the "View All" link. */
  action?: ReactNode;
  /** Heading level, so the section fits the page's outline. */
  as?: "h1" | "h2" | "h3";
  id?: string;
};

export default function SectionHeading({
  title,
  viewAllHref,
  viewAllLabel = "View All",
  action,
  as: Heading = "h2",
  id,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <Heading id={id} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-900">
        {title}
        <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--header-brand)]" />
      </Heading>
      {action ?? (viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold uppercase tracking-wider text-[var(--header-brand)] underline-offset-4 hover:underline"
        >
          {viewAllLabel}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}
