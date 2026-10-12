import { FacebookIcon, MailIcon, XIcon } from "@/app/components/header/icons";

type Props = {
  /** Absolute URL of the page being shared. */
  url: string;
  title: string;
  className?: string;
};

const buttonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-[var(--header-brand)] hover:text-white";

/** Facebook, X and email share links. Plain links, so they work without JavaScript. */
export default function ShareButtons({ url, title, className = "" }: Props) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
    { label: "Share on X", href: `https://x.com/intent/post?url=${u}&text=${t}`, Icon: XIcon },
    { label: "Share by email", href: `mailto:?subject=${t}&body=${u}`, Icon: MailIcon },
  ];

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            {...(!href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}
            className={buttonClass}
          >
            <Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
