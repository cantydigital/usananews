import { NumberedPostItem } from "@/app/components/posts";
import SectionHeading from "@/app/components/sections/SectionHeading";
import { getPopularPosts, type PostSummary } from "@/app/lib/wordpress";

type Props = {
  title?: string;
  count?: number;
  /** Leaves out the post currently being read. */
  excludeHref?: string;
  /** Defaults to the editor-picked "Most Popular Posts" from Site Settings. */
  posts?: PostSummary[];
};

/** Numbered list of popular posts for the sidebar. */
export default async function PopularPosts({
  title = "Most Popular",
  count = 5,
  excludeHref,
  posts,
}: Props) {
  const items = posts ?? (await getPopularPosts(count, excludeHref));
  if (items.length === 0) return null;

  return (
    <section aria-label={title}>
      <SectionHeading title={title} />
      <ol className="divide-y divide-neutral-200">
        {items.map((post, i) => (
          <li key={post.href} className="py-4 first:pt-0 last:pb-0">
            <NumberedPostItem post={post} number={i + 1} size="sm" />
          </li>
        ))}
      </ol>
    </section>
  );
}
