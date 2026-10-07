import { defaultNavLinks } from "@/app/components/header/Header";
import { fillWithPlaceholders, NumberedPostItem, OverlayPostCard } from "@/app/components/posts";
import {
  getFeaturedCategories,
  getLatestPosts,
  type FeaturedCategory,
  type PostSummary,
} from "@/app/lib/wordpress";
import TabbedSection from "./TabbedSection";

export type CategoryTab = FeaturedCategory;

/** Used when Homepage Settings has no Featured Categories: the first four header topics, e.g. { label: "Gut Supps", slug: "gut-supps" }. */
export const defaultCategoryTabs: CategoryTab[] = defaultNavLinks.slice(0, 4).map((link) => ({
  label: link.label,
  slug: link.href.replace(/^\//, ""),
}));

const POSTS_PER_TAB = 4;

function CategoryPanel({ posts }: { posts: PostSummary[] }) {
  const [featured, ...rest] = posts;
  if (rest.length === 0) return <OverlayPostCard post={featured} label="Featured" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
      <OverlayPostCard post={featured} label="Featured" />
      {/* Spread a full list down the card's height; keep shorter lists at the top */}
      <ol
        className={`flex flex-col divide-y divide-neutral-200 ${
          rest.length === POSTS_PER_TAB - 1 ? "justify-between" : ""
        }`}
      >
        {rest.map((post, i) => (
          <li key={`${post.href}-${i}`} className="py-5 first:pt-0 last:pb-0">
            <NumberedPostItem post={post} number={i + 1} />
          </li>
        ))}
      </ol>
    </div>
  );
}

type Props = {
  title?: string;
  /** Defaults to Homepage Settings → Featured Categories, then defaultCategoryTabs. */
  categories?: CategoryTab[];
};

/** Tabbed section showing a featured post and a numbered list for each category. */
export default async function CategoryTabs({
  title = "What's New",
  categories,
}: Props) {
  // Explicit categories win; otherwise use Homepage Settings → Featured Categories.
  const tabs = categories ?? (await getFeaturedCategories()) ?? defaultCategoryTabs;
  const postsByCategory = await Promise.all(
    tabs.map((c) => getLatestPosts(POSTS_PER_TAB, { category: c.slug })),
  );

  return (
    <TabbedSection
      title={title}
      tabs={tabs.map((category, i) => ({
        label: category.label,
        panel: (
          <CategoryPanel
            posts={
              // Placeholders only stand in for an empty category, never pad out real posts.
              postsByCategory[i].length
                ? postsByCategory[i]
                : fillWithPlaceholders([], POSTS_PER_TAB, category.label)
            }
          />
        ),
      }))}
    />
  );
}
