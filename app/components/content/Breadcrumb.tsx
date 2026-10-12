import Link from "next/link";
import { ChevronRightIcon } from "@/app/components/header/icons";

export type BreadcrumbItem = {
  label: string;
  /** Omit for the current page. */
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

/** "Home › About Us" trail; the last item is the current page. */
export default function Breadcrumb({ items, className = "" }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRightIcon aria-hidden className="h-3.5 w-3.5 text-[var(--header-brand)]" />}
            {item.href ? (
              <Link href={item.href} className="underline-offset-4 hover:text-black hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-neutral-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
