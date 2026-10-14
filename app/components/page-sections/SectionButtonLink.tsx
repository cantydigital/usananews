import Link from "next/link";
import type { ReactNode } from "react";
import type { SectionLink } from "@/app/lib/wordpress";

type Props = { link: SectionLink; className: string; children: ReactNode };

/** A section's button link: internal paths use client-side navigation; anything else (e.g. Stripe checkout) is a plain link. */
export default function SectionButtonLink({ link, className, children }: Props) {
  return link.href.startsWith("/") ? (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {children}
    </a>
  );
}
