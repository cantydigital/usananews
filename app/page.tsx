import { fillWithPlaceholders } from "@/app/components/posts";
import { CategoryTabs, FeaturedPressReleases, HeroBanner, PostGrid, PromoBanner } from "@/app/components/sections";
import { seoMetadata } from "@/app/lib/seo";
import { getFeaturedPressReleases, getHomepageCta, getLatestPosts } from "@/app/lib/wordpress";

export function generateMetadata() {
  return seoMetadata("/");
}

const HERO_COUNT = 4;
const TOP_STORIES_COUNT = 4;
const FEATURED_PRESS_RELEASES_COUNT = 3;

export default async function Home() {
  const [latest, cta, pressReleases] = await Promise.all([
    getLatestPosts(HERO_COUNT + TOP_STORIES_COUNT),
    getHomepageCta(),
    getFeaturedPressReleases(FEATURED_PRESS_RELEASES_COUNT),
  ]);
  const posts = fillWithPlaceholders(latest, HERO_COUNT + TOP_STORIES_COUNT);

  return (
    <main className="flex-1 bg-[var(--header-bg)]">
      <HeroBanner posts={posts.slice(0, HERO_COUNT)} />
      {/* Homepage Settings → Show Homepage CTA Box */}
      {cta && (
        <PromoBanner
          eyebrow={cta.topText ?? undefined}
          title={cta.title}
          subtitle={cta.description ?? undefined}
          cta={cta.button}
        />
      )}
      {/* Press releases with "Feature Press Release" ticked */}
      <FeaturedPressReleases releases={pressReleases} />
      <PostGrid title="Top Stories" posts={posts.slice(HERO_COUNT)} viewAllHref="/news" />
      <CategoryTabs />
    </main>
  );
}
