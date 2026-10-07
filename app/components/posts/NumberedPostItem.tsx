import Link from "next/link";
import { CalendarIcon } from "@/app/components/header/icons";
import type { PostSummary } from "@/app/lib/wordpress";
import PostImage from "./PostImage";
import { formatDate } from "./PostMeta";

type Props = {
  post: PostSummary;
  number: number;
};

/** Compact ranked row: number, thumbnail, title and date. */
export default function NumberedPostItem({ post, number }: Props) {
  return (
    <article className="group relative flex items-center gap-4">
      <span aria-hidden className="w-5 shrink-0 text-center text-lg font-bold text-[var(--header-brand)]">
        {number}
      </span>
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:w-32">
        <PostImage post={post} sizes="128px" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="line-clamp-3 text-base font-bold leading-snug text-neutral-900">
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
