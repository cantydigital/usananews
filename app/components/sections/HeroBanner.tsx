import Link from "next/link";
import {
  CategoryBadge,
  fillWithPlaceholders,
  OverlayPostCard,
  PostImage,
  PostMeta,
} from "@/app/components/posts";
import { getLatestPosts, type PostSummary } from "@/app/lib/wordpress";

const SLOTS = 4;

function SidePost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="relative min-h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
        <PostImage post={post} sizes="144px" />
      </div>
      <div className="flex min-w-0 flex-col items-start justify-center gap-2 py-1">
        {post.category && <CategoryBadge name={post.category} />}
        <h3 className="line-clamp-3 text-base font-bold leading-snug text-neutral-900">
          <Link href={post.href} className="underline-offset-4 group-hover:underline">
            <span aria-hidden className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>
        <PostMeta post={post} />
      </div>
    </article>
  );
}

type HeroBannerProps = {
  /** Defaults to the latest WordPress posts. The first post is featured. */
  posts?: PostSummary[];
};

export default async function HeroBanner({ posts }: HeroBannerProps) {
  const [featured, ...rest] = fillWithPlaceholders(posts ?? (await getLatestPosts(SLOTS)), SLOTS);

  return (
    <section aria-label="Featured stories" className="w-full font-sans">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:px-8 lg:py-10">
        <OverlayPostCard post={featured} size="lg" headingLevel="h2" priority />
        <div className="grid gap-4 lg:grid-rows-3">
          {rest.map((post, i) => (
            <SidePost key={`${post.href}-${i}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
