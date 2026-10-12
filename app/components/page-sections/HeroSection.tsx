import Image from "next/image";
import Breadcrumb, { type BreadcrumbItem } from "@/app/components/content/Breadcrumb";
import type { SectionImage } from "@/app/lib/wordpress";

type Props = {
  title: string | null;
  description?: string | null;
  image?: SectionImage | null;
  /** Shown under the title, e.g. Home › About Us. */
  breadcrumb?: BreadcrumbItem[];
  /** h1 when the hero opens the page, otherwise h2. */
  headingLevel?: "h1" | "h2";
  /** Load the image eagerly; set for heroes at the top of the page. */
  priority?: boolean;
};

/**
 * Full-width banner: left-aligned title, description and breadcrumb, with the image on the
 * right fading into the page background.
 */
export default function HeroSection({
  title,
  description,
  image,
  breadcrumb,
  headingLevel: Heading = "h2",
  priority,
}: Props) {
  if (!title && !description) return null;

  return (
    <section className="relative isolate w-full overflow-hidden border-b border-neutral-200 bg-[var(--header-bg)]">
      {image && (
        <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full md:w-3/4 lg:w-2/3">
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 67vw, (min-width: 768px) 75vw, 100vw"
            priority={priority}
            className="object-cover"
          />
          {/* Fade the image into the background so the text stays readable */}
          <div className="absolute inset-0 bg-[var(--header-bg)]/80 md:bg-transparent md:bg-gradient-to-r md:from-[var(--header-bg)] md:via-[var(--header-bg)]/70 md:to-[var(--header-bg)]/10" />
        </div>
      )}

      <div
        className={`mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8 ${
          // Without an image, there's nothing to show off, so keep the banner compact.
          image ? "min-h-[260px] py-14 sm:min-h-[320px] lg:min-h-[380px]" : "py-10 lg:py-14"
        }`}
      >
        <div className="max-w-xl">
          {title && (
            <Heading className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {title}
            </Heading>
          )}
          {description && <p className="mt-3 text-lg font-medium text-neutral-700">{description}</p>}
          {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} className="mt-5" />}
        </div>
      </div>
    </section>
  );
}
