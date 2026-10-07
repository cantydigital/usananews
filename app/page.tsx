import { fillWithPlaceholders } from "@/app/components/posts";
import { CategoryTabs, HeroBanner, PostGrid, PromoBanner } from "@/app/components/sections";
import { seoMetadata } from "@/app/lib/seo";
import { getLatestPosts } from "@/app/lib/wordpress";

export function generateMetadata() {
  return seoMetadata("/");
}

const HERO_COUNT = 4;
const TOP_STORIES_COUNT = 4;

export default async function Home() {
  const posts = fillWithPlaceholders(
    await getLatestPosts(HERO_COUNT + TOP_STORIES_COUNT),
    HERO_COUNT + TOP_STORIES_COUNT,
  );

  return (
    <main className="flex-1 bg-[var(--header-bg)]">
      <HeroBanner posts={posts.slice(0, HERO_COUNT)} />
      <PromoBanner
        eyebrow="The Weekly Dose"
        title="Evidence-based supplement news"
        subtitle="The latest research, explained in plain English and delivered every Friday."
        highlight={{ label: "Subscription", value: "Free" }}
        cta={{ label: "Subscribe", href: "/subscribe" }}
      />
      <PostGrid title="Top Stories" posts={posts.slice(HERO_COUNT)} viewAllHref="/news" />
      <CategoryTabs />
    </main>
  );
}
