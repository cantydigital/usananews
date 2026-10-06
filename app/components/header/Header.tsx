import Image from "next/image";
import Link from "next/link";
import { getSiteLogo } from "@/app/lib/wordpress";
import type { ComponentType, ReactNode, SVGProps } from "react";
import AnnouncementBar from "./AnnouncementBar";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import { FacebookIcon, InstagramIcon, SearchIcon, YoutubeIcon } from "./icons";
import type { NavLink, SocialLink, SocialNetwork } from "./types";

const socialIcons: Record<SocialNetwork, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
};

export const defaultNavLinks: NavLink[] = [
  { label: "Gut Supps", href: "/gut-supps" },
  { label: "Joint Supps", href: "/joint-supps" },
  { label: "Anti-Aging Supps", href: "/anti-aging-supps" },
  { label: "Brain Supps", href: "/brain-supps" },
  { label: "Metabolic Supps", href: "/metabolic-supps" },
  { label: "Women's Health", href: "/womens-health" },
];

export const defaultSocialLinks: SocialLink[] = [
  { network: "facebook", href: "https://facebook.com" },
  { network: "instagram", href: "https://instagram.com" },
  { network: "youtube", href: "https://youtube.com" },
];

export const defaultAnnouncements = [
  "Free Standard Post Orders $125+",
  "Australian owned & operated",
];

type HeaderProps = {
  navLinks?: NavLink[];
  socialLinks?: SocialLink[];
  announcements?: string[];
  /** Custom logo; defaults to the WordPress Site Settings logo, then the badge placeholder. */
  logo?: ReactNode;
};

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-black/5";

async function SiteLogo() {
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

export default function Header({
  navLinks = defaultNavLinks,
  socialLinks = defaultSocialLinks,
  announcements = defaultAnnouncements,
  logo = <SiteLogo />,
}: HeaderProps) {
  return (
    <header className="relative z-30 w-full font-sans [--header-bg:#f7f6f3] [--header-brand:#534388]">
      {/* Top announcement bar */}
      <div className="bg-[var(--header-brand)] text-white">
        <div className="mx-auto grid h-10 max-w-7xl grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-8">
          <ul className="hidden items-center gap-4 sm:flex">
            {socialLinks.map(({ network, href }) => {
              const Icon = socialIcons[network];
              return (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={network}
                    className="opacity-90 transition hover:opacity-100"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>

          <AnnouncementBar messages={announcements} />

          {/* Empty column keeps the announcement centred */}
          <div aria-hidden className="hidden sm:block" />
        </div>
      </div>

      {/* Main navigation */}
      <div className="relative border-b border-neutral-200 bg-[var(--header-bg)]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <MobileMenu links={navLinks} />

          <Link href="/" className="shrink-0" aria-label="Home">
            {logo}
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks links={navLinks} className="flex items-center gap-7" />
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
