import { useId } from "react";
import { PostCard } from "@/app/components/posts";
import type { PostSummary } from "@/app/lib/wordpress";
import SectionHeading from "./SectionHeading";

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

const imageSizes = {
  2: "(min-width: 640px) 50vw, 100vw",
  3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  4: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
} as const;

type Props = {
  title: string;
  posts: PostSummary[];
  viewAllHref?: string;
  /** Cards per row on large screens. */
  columns?: keyof typeof columnClasses;
};

/** Titled grid of post cards, e.g. "Top Stories" or a category listing. */
export default function PostGrid({ title, posts, viewAllHref, columns = 4 }: Props) {
  const headingId = useId();
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="w-full font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading id={headingId} title={title} viewAllHref={viewAllHref} />
        <div className={`grid gap-x-6 gap-y-10 ${columnClasses[columns]}`}>
          {posts.map((post, i) => (
            <PostCard key={`${post.href}-${i}`} post={post} sizes={imageSizes[columns]} />
          ))}
        </div>
      </div>
    </section>
  );
}
