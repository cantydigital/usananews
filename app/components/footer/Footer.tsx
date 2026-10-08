import Link from "next/link";
import type { ReactNode } from "react";
import { defaultNavLinks, SiteLogo, socialNetworks } from "@/app/components/header/Header";
import type { NavLink, SocialLink } from "@/app/components/header/types";
import { getSocialLinks } from "@/app/lib/wordpress";
import BackToTop from "./BackToTop";

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const defaultFooterColumns: FooterColumn[] = [
  {
    heading: "About Us",
    links: [
      { label: "About USANA News", href: "/about-us" },
      { label: "Our writers", href: "/writers" },
      { label: "Editorial standards", href: "/editorial-standards" },
      { label: "Advertise with us", href: "/advertise" },
    ],
  },
  { heading: "Topics", links: defaultNavLinks },
  {
    heading: "Membership",
    links: [
      { label: "Subscribe to newsletters", href: "/subscribe" },
      { label: "Subscription terms", href: "/subscription-terms" },
    ],
  },
  {
    heading: "Contact Us",
    links: [
      { label: "Get support", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
      { label: "Copyright & licensing", href: "/copyright" },
    ],
  },
];

export const defaultLegalLinks: NavLink[] = [
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Cookie policy", href: "/cookie-policy" },
  { label: "Terms of use", href: "/terms-of-use" },
];

type FooterProps = {
  columns?: FooterColumn[];
  legalLinks?: NavLink[];
  /** Defaults to the links set in WordPress Site Settings. */
  socialLinks?: SocialLink[];
  /** Custom logo; defaults to the same logo as the header. */
  logo?: ReactNode;
};

const linkClass = "text-neutral-600 underline-offset-4 transition-colors hover:text-black hover:underline";

function SocialLinkItems({ links }: { links: SocialLink[] }) {
  return links.map(({ network, href }) => {
    const { label, Icon } = socialNetworks[network];
    return (
      <li key={network}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-black/5"
        >
          <Icon className="h-5 w-5" />
        </a>
      </li>
    );
  });
}

async function SiteSocialLinks() {
  return <SocialLinkItems links={await getSocialLinks()} />;
}

export default function Footer({
  columns = defaultFooterColumns,
  legalLinks = defaultLegalLinks,
  socialLinks,
  logo = <SiteLogo />,
}: FooterProps) {
  return (
    <footer className="mt-auto w-full bg-[var(--header-bg)] font-sans text-neutral-800">
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* Divider with centred back-to-top button */}
        <div className="relative flex justify-center border-t border-neutral-300">
          <div className="-translate-y-1/2">
            <BackToTop />
          </div>
        </div>

        {/* Logo, socials and subscribe */}
        <div className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-center">
          <Link href="/" className="shrink-0" aria-label="Home">
            {logo}
          </Link>

          <div className="flex flex-wrap items-center gap-6 sm:ml-auto">
            <ul className="flex items-center gap-2">
              {socialLinks ? <SocialLinkItems links={socialLinks} /> : <SiteSocialLinks />}
            </ul>
            <Link
              href="/subscribe"
              className="inline-flex h-10 items-center bg-[var(--header-brand)] px-5 text-sm font-semibold uppercase tracking-wider text-white transition hover:brightness-110"
            >
              Subscribe
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-neutral-200 py-10 lg:grid-cols-4"
        >
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
                {column.heading}
              </h2>
              <ul className="space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Disclaimer */}
        <p className="pt-8 text-xs leading-relaxed text-neutral-600">
          <strong className="font-bold uppercase text-black">A note about health content:</strong>{" "}
          Articles on this site are for general information only and are not a substitute for
          advice from a qualified health professional. Always talk to your doctor before starting a
          new supplement, especially if you are pregnant, breastfeeding, taking medication or
          managing a medical condition.{" "}
          <Link
            href="/editorial-standards"
            className="text-[var(--header-brand)] underline-offset-4 hover:underline"
          >
            Read our editorial standards
          </Link>
          .
        </p>

        {/* Copyright and legal links */}
        <div className="mt-6 flex flex-col gap-4 text-xs text-neutral-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} USANA News. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-y-2 divide-x divide-neutral-300">
            {legalLinks.map((link) => (
              <li key={link.href} className="px-4 first:pl-0 last:pr-0">
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
