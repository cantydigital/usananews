import Link from "next/link";
import { CalendarIcon, CommentIcon } from "@/app/components/header/icons";
import type { PostSummary } from "@/app/lib/wordpress";
import AuthorAvatar from "./AuthorAvatar";
import CategoryBadge from "./CategoryBadge";
import PostImage from "./PostImage";
import { formatDate } from "./PostMeta";

type Props = {
  post: PostSummary;
  /** Badge text; defaults to the post's category. */
  label?: string;
  /** "lg" adds the excerpt and comment count, for lead stories. */
  size?: "md" | "lg";
  sizes?: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Image card with the title and meta laid over a dark fade. */
export default function OverlayPostCard({
  post,
  label = post.category ?? undefined,
  size = "md",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority,
  headingLevel: Heading = "h3",
  className = "",
}: Props) {
  const large = size === "lg";

  return (
    <article
      className={`group relative isolate flex overflow-hidden rounded-2xl bg-neutral-900 ${
        large ? "min-h-[420px] sm:min-h-[520px]" : "min-h-[360px] sm:min-h-[420px]"
      } ${className}`}
    >
      <PostImage post={post} sizes={sizes} priority={priority} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className={`relative mt-auto flex flex-col items-start text-white ${large ? "gap-4 p-6 sm:p-8" : "gap-3 p-6"}`}>
        {label && <CategoryBadge name={label} />}
        <Heading
          className={`max-w-xl font-bold leading-tight tracking-tight ${
            large ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          }`}
        >
          <Link href={post.href} className="underline-offset-4 hover:underline">
            {/* Stretch the link so the whole card is clickable */}
            <span aria-hidden className="absolute inset-0" />
            {post.title}
          </Link>
        </Heading>
        {large && post.excerpt && (
          <p className="line-clamp-2 max-w-lg text-sm font-medium text-white/85 sm:text-base">
            {post.excerpt}
          </p>
        )}
        <ul className={`flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold ${large ? "text-sm" : "text-xs"}`}>
          <li className="flex items-center gap-2">
            <AuthorAvatar author={post.author} className={large ? "h-7 w-7" : "h-5 w-5"} />
            By {post.author.name}
          </li>
          <li className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </li>
          {large && (
            <li className="flex items-center gap-2">
              <CommentIcon className="h-4 w-4" />
              {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
            </li>
          )}
        </ul>
      </div>
    </article>
  );
}
