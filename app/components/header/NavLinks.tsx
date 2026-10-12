"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./types";

type Props = {
  links: NavLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export default function NavLinks({
  links,
  className = "",
  linkClassName = "",
  onNavigate,
}: Props) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              {...(link.newTab && { target: "_blank", rel: "noopener noreferrer" })}
              aria-current={active ? "page" : undefined}
              className={`text-sm font-semibold uppercase tracking-wider underline-offset-4 transition-colors hover:underline ${
                active ? "text-black underline" : "text-neutral-600 hover:text-black"
              } ${linkClassName}`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
