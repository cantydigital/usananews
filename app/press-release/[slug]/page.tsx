import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/app/components/content";
import { MailIcon, PhoneIcon } from "@/app/components/header/icons";
import { formatDate, PostContent, ShareButtons } from "@/app/components/posts";
import { Sidebar } from "@/app/components/sidebar";
import { SITE_URL } from "@/app/lib/site";
import { getPressRelease } from "@/app/lib/wordpress";

// No press releases are prerendered, so builds don't need WordPress; each renders on its first visit,
// then stays cached.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/press-release/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const release = await getPressRelease(slug).catch(() => null);
  if (!release) return {};

  return {
    // Yoast titles already include the site name, so skip the layout's title template.
    title: release.seo.title ? { absolute: release.seo.title } : release.title,
    description: release.seo.description ?? release.subtitle ?? release.excerpt,
  };
}

const contactLinkClass =
  "inline-flex items-center gap-2 font-medium text-[var(--header-brand)] underline-offset-4 hover:underline";

export default async function PressReleasePage({ params }: PageProps<"/press-release/[slug]">) {
  const { slug } = await params;
  const release = await getPressRelease(slug);
  if (!release) notFound();

  return (
    <main className="flex-1 bg-[var(--header-bg)] font-sans">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <header>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Press Release" }]} />

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-sm bg-[var(--header-brand)] px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wider text-white">
                Press Release
              </span>
              {release.category && (
                <span className="rounded-md px-2 py-0.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-300">
                  {release.category}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
              {release.title}
            </h1>
            {release.subtitle && (
              <p className="mt-4 text-lg leading-relaxed text-neutral-700 sm:text-xl">{release.subtitle}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                {release.company && (
                  <>
                    <span className="font-semibold text-neutral-900">{release.company}</span>
                    <span aria-hidden className="text-neutral-400">
                      /
                    </span>
                  </>
                )}
                <span>
                  Published: <time dateTime={release.date}>{formatDate(release.date)}</time>
                </span>
              </p>
              <ShareButtons url={`${SITE_URL}${release.href}`} title={release.title} />
            </div>
          </header>

          {release.image && (
            <figure className="relative mt-6 overflow-hidden rounded-2xl bg-neutral-200">
              <Image
                src={release.image.url}
                alt={release.image.alt}
                width={release.image.width}
                height={release.image.height}
                sizes="(min-width: 1280px) 860px, (min-width: 1024px) 65vw, 100vw"
                priority
                className="h-auto w-full"
              />
            </figure>
          )}

          <PostContent html={release.content} className="mt-8" />

          {(release.contactName || release.company) && (
            <section aria-labelledby="media-contact-heading" className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <h2 id="media-contact-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--header-brand)]">
                Media contact
              </h2>
              <p className="mt-2 font-semibold text-neutral-900">{release.contactName ?? release.company}</p>
              {release.contactName && release.company && <p className="text-sm text-neutral-600">{release.company}</p>}
              {(release.contactEmail || release.contactPhone) && (
                <ul className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
                  {release.contactEmail && (
                    <li>
                      <a href={`mailto:${release.contactEmail}`} className={contactLinkClass}>
                        <MailIcon className="h-4 w-4 shrink-0" />
                        <span className="break-all">{release.contactEmail}</span>
                      </a>
                    </li>
                  )}
                  {release.contactPhone && (
                    <li>
                      <a href={`tel:${release.contactPhone.replace(/[^\d+]/g, "")}`} className={contactLinkClass}>
                        <PhoneIcon className="h-4 w-4 shrink-0" />
                        {release.contactPhone}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </section>
          )}

          <p className="mt-8 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
            This press release was supplied by {release.company ?? "the issuing organisation"} and published after
            editorial review.{" "}
            <Link
              href="/submit-press-release"
              className="font-semibold text-[var(--header-brand)] underline-offset-4 hover:underline"
            >
              Submit your own press release
            </Link>
          </p>
        </article>

        <Sidebar currentHref={release.href} />
      </div>
    </main>
  );
}
