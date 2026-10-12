import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  /** Small label above the title. */
  eyebrow?: string;
  /** Emphasised figure in the middle, e.g. { label: "Price starts at", value: "$49" }. */
  highlight?: { label: string; value: string };
  /** Button; left out when not set. */
  cta?: { label: string; href: string } | null;
  /** Product or campaign image on the left; diagonal brand stripes are shown when omitted. */
  image?: { src: string; alt: string; width: number; height: number };
};

/** Full-width promotional strip for campaigns, products or the newsletter. */
export default function PromoBanner({ title, subtitle, eyebrow, highlight, cta, image }: Props) {
  const external = cta ? /^https?:\/\//i.test(cta.href) : false;

  return (
    <section aria-label={title} className="w-full font-sans">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-[#2b2248] via-[var(--header-brand)] to-[#7a68b5] text-white">
          {/* Decorative diagonal stripes */}
          <div aria-hidden className="absolute inset-y-0 left-0 -z-10 hidden w-72 sm:block">
            <div className="absolute -left-16 top-0 h-[200%] w-24 -translate-y-1/4 rotate-[25deg] bg-white/10" />
            <div className="absolute left-16 top-0 h-[200%] w-10 -translate-y-1/4 rotate-[25deg] bg-white/15" />
            <div className="absolute left-36 top-0 h-[200%] w-4 -translate-y-1/4 rotate-[25deg] bg-white/20" />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent_40%)]"
          />

          <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 md:flex-row md:items-center md:gap-10 lg:px-14">
            {image && (
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="hidden h-28 w-auto shrink-0 object-contain md:block"
              />
            )}

            <div className={`min-w-0 flex-1 ${image ? "" : "sm:pl-40"}`}>
              {eyebrow && (
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/75">{eyebrow}</p>
              )}
              <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h2>
              {subtitle && <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{subtitle}</p>}
            </div>

            {highlight && (
              <div className="shrink-0">
                <p className="text-sm font-medium text-white/80">{highlight.label}</p>
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{highlight.value}</p>
              </div>
            )}

            {cta && (
              <Link
                href={cta.href}
                {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-flex h-12 shrink-0 items-center justify-center self-start rounded-md bg-white px-8 text-sm font-bold uppercase tracking-wider text-[var(--header-brand)] shadow-sm transition hover:bg-white/90 md:self-auto"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
