import Link from "next/link";
import { CalendarIcon } from "@/app/components/header/icons";
import type { PostSummary } from "@/app/lib/wordpress";
import PostImage from "./PostImage";
import { formatDate } from "./PostMeta";

type Props = {
  post: PostSummary;
  number: number;
  /** "sm" fits narrow columns such as the sidebar. */
  size?: "sm" | "md";
};

/** Compact ranked row: number, thumbnail, title and date. */
export default function NumberedPostItem({ post, number, size = "md" }: Props) {
  const small = size === "sm";

  return (
    <article className={`group relative flex items-center ${small ? "gap-3" : "gap-4"}`}>
      <span aria-hidden className={`w-5 shrink-0 text-center font-bold text-[var(--header-brand)] ${small ? "text-base" : "text-lg"}`}>
        {number}
      </span>
      <div
        className={`relative aspect-[4/3] shrink-0 overflow-hidden ${small ? "w-20 rounded-lg" : "w-28 rounded-xl sm:w-32"}`}
      >
        <PostImage post={post} sizes={small ? "80px" : "128px"} />
      </div>
      <div className={`flex min-w-0 flex-col ${small ? "gap-1.5" : "gap-2"}`}>
        <h3 className={`line-clamp-3 font-bold leading-snug text-neutral-900 ${small ? "text-sm" : "text-base"}`}>
          <Link href={post.href} className="underline-offset-4 group-hover:underline">
            {/* Stretch the link so the whole row is clickable */}
            <span aria-hidden className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
          <CalendarIcon className="h-3.5 w-3.5" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </div>
    </article>
  );
}
