import Link from "next/link";
import type { PostSummary } from "@/app/lib/wordpress";
import CategoryBadge from "./CategoryBadge";
import PostImage from "./PostImage";
import PostMeta from "./PostMeta";

type Props = {
  post: PostSummary;
  /** Hide the category label, e.g. on that category's own page. */
  showCategory?: boolean;
};

/** List card: image on the left, category, title, excerpt and meta on the right; stacks on mobile. */
export default function HorizontalPostCard({ post, showCategory = true }: Props) {
  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:flex-row sm:gap-6">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:aspect-[4/3] sm:w-56 lg:w-64">
        <PostImage post={post} sizes="(min-width: 1024px) 256px, (min-width: 640px) 224px, 100vw" />
      </div>
      <div className="flex min-w-0 flex-col items-start justify-center gap-2 px-1 pb-2 sm:px-0 sm:py-2 sm:pr-3">
        {showCategory && post.category && <CategoryBadge name={post.category} variant="text" />}
        <h2 className="text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
          <Link href={post.href} className="underline-offset-4 group-hover:underline">
            {/* Stretch the link so the whole card is clickable */}
            <span aria-hidden className="absolute inset-0" />
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="line-clamp-2 text-sm text-neutral-600">{post.excerpt}</p>}
        <PostMeta post={post} />
      </div>
    </article>
  );
}
