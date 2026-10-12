import { CalendarIcon } from "@/app/components/header/icons";
import type { PostSummary } from "@/app/lib/wordpress";
import AuthorAvatar from "./AuthorAvatar";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact "By author · date" line used on post cards. */
export default function PostMeta({ post }: { post: PostSummary }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-neutral-600">
      <span className="flex items-center gap-1.5">
        <AuthorAvatar author={post.author} className="h-4 w-4" />
        By {post.author.name}
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarIcon className="h-3.5 w-3.5" />
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </span>
    </p>
  );
}
