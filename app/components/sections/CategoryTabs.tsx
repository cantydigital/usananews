import { defaultNavLinks } from "@/app/components/header/Header";
import { fillWithPlaceholders, NumberedPostItem, OverlayPostCard } from "@/app/components/posts";
import { getLatestPosts, type PostSummary } from "@/app/lib/wordpress";
import TabbedSection from "./TabbedSection";

export type CategoryTab = {
  label: string;
  /** WordPress category slug. */
  slug: string;
};

/** First four header topics, e.g. { label: "Gut Supps", slug: "gut-supps" }. */
export const defaultCategoryTabs: CategoryTab[] = defaultNavLinks.slice(0, 4).map((link) => ({
  label: link.label,
  slug: link.href.replace(/^\//, ""),
}));

const POSTS_PER_TAB = 4;

function CategoryPanel({ posts }: { posts: PostSummary[] }) {
  const [featured, ...rest] = posts;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
      <OverlayPostCard post={featured} label="Featured" />
      <ol className="flex flex-col justify-between divide-y divide-neutral-200">
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
  categories?: CategoryTab[];
};

/** Tabbed section showing a featured post and a numbered list for each category. */
export default async function CategoryTabs({
  title = "What's New",
  categories = defaultCategoryTabs,
}: Props) {
  const postsByCategory = await Promise.all(
    categories.map((c) => getLatestPosts(POSTS_PER_TAB, { category: c.slug })),
  );

  return (
    <TabbedSection
      title={title}
      tabs={categories.map((category, i) => ({
        label: category.label,
        panel: (
          <CategoryPanel
            posts={fillWithPlaceholders(postsByCategory[i], POSTS_PER_TAB, category.label)}
          />
        ),
      }))}
    />
  );
}
