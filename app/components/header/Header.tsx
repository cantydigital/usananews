import Image from "next/image";
import Link from "next/link";
import { getAnnouncements, getMenu, getSiteLogo, getSocialLinks } from "@/app/lib/wordpress";
import type { ComponentType, ReactNode, SVGProps } from "react";
import AnnouncementBar from "./AnnouncementBar";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  SearchIcon,
  XIcon,
  YoutubeIcon,
} from "./icons";
import type { NavLink, SocialLink, SocialNetwork } from "./types";

export const socialNetworks: Record<
  SocialNetwork,
  { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  facebook: { label: "Facebook", Icon: FacebookIcon },
  instagram: { label: "Instagram", Icon: InstagramIcon },
  youtube: { label: "YouTube", Icon: YoutubeIcon },
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  x: { label: "X", Icon: XIcon },
};

/** Shown until a menu is assigned to the "Header Menu" location in WordPress. */
export const defaultNavLinks: NavLink[] = [
  { label: "Gut Supps", href: "/gut-supps" },
  { label: "Joint Supps", href: "/joint-supps" },
  { label: "Anti-Aging Supps", href: "/anti-aging-supps" },
  { label: "Brain Supps", href: "/brain-supps" },
  { label: "Metabolic Supps", href: "/metabolic-supps" },
  { label: "Women's Health", href: "/womens-health" },
];

/** Shown only if WordPress can't be reached. */
export const defaultAnnouncements = [
  "Free Standard Post Orders $125+",
  "Australian owned & operated",
];

type HeaderProps = {
  /** Defaults to the WordPress "Header Menu", then defaultNavLinks. */
  navLinks?: NavLink[];
  /** Defaults to the links set in WordPress Site Settings. */
  socialLinks?: SocialLink[];
  /** Defaults to the WordPress Site Settings announcements. */
  announcements?: string[];
  /** Custom logo; defaults to the WordPress Site Settings logo, then the badge placeholder. */
  logo?: ReactNode;
};

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-black/5";

export async function SiteLogo() {
  const logo = await getSiteLogo();
  if (!logo) return <Logo className="h-12 w-auto" />;

  return (
    <Image
      src={logo.url}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority
      // The optimizer rejects SVGs by default; serve them as-is.
      unoptimized={logo.mimeType === "image/svg+xml"}
      className="h-12 w-auto"
    />
  );
}

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
          className="opacity-90 transition hover:opacity-100"
        >
          <Icon className="h-4 w-4" />
        </a>
      </li>
    );
  });
}

async function SiteSocialLinks() {
  return <SocialLinkItems links={await getSocialLinks()} />;
}

async function SiteAnnouncements() {
  const announcements = await getAnnouncements();
  return <AnnouncementBar messages={announcements ?? defaultAnnouncements} />;
}

export default async function Header({
  navLinks,
  socialLinks,
  announcements,
  logo = <SiteLogo />,
}: HeaderProps) {
  // Top-level items of the WordPress "Header Menu"; sub-items aren't shown yet.
  const links =
    navLinks ??
    (await getMenu("HEADER_MENU"))?.map(({ label, href, newTab }) => ({ label, href, newTab })) ??
    defaultNavLinks;

  return (
    <header className="relative z-30 w-full font-sans">
      {/* Top announcement bar */}
      <div className="bg-[var(--header-brand)] text-white">
        <div className="mx-auto grid h-10 max-w-7xl grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-8">
          {/* Always rendered so the announcement stays centred */}
          <ul className="hidden items-center gap-4 sm:flex">
            {socialLinks ? <SocialLinkItems links={socialLinks} /> : <SiteSocialLinks />}
          </ul>

          {announcements ? (
            <AnnouncementBar messages={announcements} />
          ) : (
            <SiteAnnouncements />
          )}

          {/* Empty column keeps the announcement centred */}
          <div aria-hidden className="hidden sm:block" />
        </div>
      </div>

      {/* Main navigation */}
      <div className="relative border-b border-neutral-200 bg-[var(--header-bg)]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <MobileMenu links={links} />

          <Link href="/" className="shrink-0" aria-label="Home">
            {logo}
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks links={links} className="flex items-center gap-7" />
          </nav>

          <div className="ml-auto flex items-center">
            <Link href="/search" aria-label="Search" className={iconButton}>
              <SearchIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
