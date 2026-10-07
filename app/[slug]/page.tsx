import Image from "next/image";
import { notFound } from "next/navigation";
import {
  AuthorAvatar,
  CategoryBadge,
  formatDate,
  PostContent,
  ShareButtons,
} from "@/app/components/posts";
import { Sidebar } from "@/app/components/sidebar";
import { seoMetadata } from "@/app/lib/seo";
import { SITE_URL } from "@/app/lib/site";
import { getPost, getRecentPostSlugs, type Post } from "@/app/lib/wordpress";

// Prerender recent posts at build time; older or new posts render on first visit, then stay cached.
export async function generateStaticParams() {
  return (await getRecentPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  return seoMetadata(`/${slug}/`);
}

/** Collapses text for comparison, ignoring tags, punctuation and spacing. */
function normalise(text: string) {
  return text.replace(/<[^>]*>/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}

/** The excerpt works as a standfirst only when it was written by hand, not cut from the opening paragraph. */
function hasCustomExcerpt(post: Post) {
  const excerpt = normalise(post.excerpt);
  return excerpt.length > 0 && !normalise(post.content).startsWith(excerpt.slice(0, 80));
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="flex-1 bg-[var(--header-bg)] font-sans">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <header>
            {post.category && (
              <div className="mb-4">
                <CategoryBadge name={post.category} />
              </div>
            )}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                <span className="flex items-center gap-2 font-semibold text-neutral-900">
                  <AuthorAvatar author={post.author} className="h-8 w-8" />
                  {post.author.name}
                </span>
                <span aria-hidden className="text-neutral-400">
                  /
                </span>
                <span>
                  Published: <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                {post.readingTime && (
                  <>
                    <span aria-hidden className="text-neutral-400">
                      /
                    </span>
                    <span>{post.readingTime} min read</span>
                  </>
                )}
              </p>
              <ShareButtons url={`${SITE_URL}${post.href}`} title={post.title} />
            </div>
          </header>

          {post.image && (
            <figure className="relative mt-6 overflow-hidden rounded-2xl bg-neutral-200">
              <Image
                src={post.image.url}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                sizes="(min-width: 1280px) 860px, (min-width: 1024px) 65vw, 100vw"
                priority
                className="h-auto w-full"
              />
              {post.imageCaption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-2.5 text-sm text-white sm:px-5">
                  {post.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {hasCustomExcerpt(post) && (
            <p className="mt-8 text-lg leading-relaxed text-neutral-700 sm:text-xl">{post.excerpt}</p>
          )}

          <PostContent html={post.content} className="mt-8" />
        </article>

        <Sidebar currentHref={post.href} />
      </div>
    </main>
  );
}
