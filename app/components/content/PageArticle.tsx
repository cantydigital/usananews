import Image from "next/image";
import { PageSections } from "@/app/components/page-sections";
import { PostContent } from "@/app/components/posts";
import type { Page } from "@/app/lib/wordpress";
import Breadcrumb from "./Breadcrumb";

function breadcrumbFor(page: Page) {
  return [{ label: "Home", href: "/" }, { label: page.title }];
}

function PageHeader({ page }: { page: Page }) {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
      <Breadcrumb items={breadcrumbFor(page)} />
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
        {page.title}
      </h1>
      <span aria-hidden className="mt-5 block h-1 w-16 rounded-full bg-[var(--header-brand)]" />
    </header>
  );
}

/**
 * Layout for WordPress pages such as About Us: a title header (unless the page opens with a Hero
 * section, which takes its place), the "Page Content" sections in order, then any editor content.
 */
export default function PageArticle({ page }: { page: Page }) {
  const opensWithHero = page.sections[0]?.type === "hero";

  return (
    <main className={`flex-1 bg-[var(--header-bg)] pb-8 font-sans lg:pb-12 ${opensWithHero ? "" : "pt-8 lg:pt-12"}`}>
      <article className="flex flex-col gap-12 lg:gap-16">
        {!opensWithHero && <PageHeader page={page} />}

        {page.image && !opensWithHero && (
          <figure className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-neutral-200">
            <Image
              src={page.image.url}
              alt={page.image.alt}
              width={page.image.width}
              height={page.image.height}
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority
              className="h-auto w-full"
            />
            {page.imageCaption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-2.5 text-sm text-white sm:px-5">
                {page.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <PageSections
          sections={page.sections}
          startsPage={opensWithHero}
          breadcrumb={breadcrumbFor(page)}
          pagePath={page.href}
        />

        {page.content.trim() && (
          <PostContent html={page.content} className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0" />
        )}
      </article>
    </main>
  );
}
