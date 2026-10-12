import Link from "next/link";
import type { PostSummary } from "@/app/lib/wordpress";
import CategoryBadge from "./CategoryBadge";
import PostImage from "./PostImage";
import PostMeta from "./PostMeta";

type Props = {
  post: PostSummary;
  /** Passed to the image so the browser picks the right size. */
  sizes?: string;
};

/** Vertical card: image on top, category, title and meta below. */
export default function PostCard({
  post,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
}: Props) {
  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200">
        <PostImage post={post} sizes={sizes} />
      </div>
      {post.category && <CategoryBadge name={post.category} variant="text" />}
      <h3 className="line-clamp-3 text-base font-bold leading-snug text-neutral-900">
        <Link href={post.href} className="underline-offset-4 group-hover:underline">
          {/* Stretch the link so the whole card is clickable */}
          <span aria-hidden className="absolute inset-0" />
          {post.title}
        </Link>
      </h3>
      <PostMeta post={post} />
    </article>
  );
}
