import { HeroSection } from "@/app/components/page-sections";
import { HorizontalPostCard, OverlayPostCard, Pagination } from "@/app/components/posts";
import { Sidebar } from "@/app/components/sidebar";
import type { Category, PostSummary } from "@/app/lib/wordpress";

type Props = {
  category: Category;
  posts: PostSummary[];
  page: number;
  totalPages: number;
};

/** Category listing: title banner, the newest post featured on page 1, a paged list, and the sidebar. */
export default function CategoryArchive({ category, posts, page, totalPages }: Props) {
  const featured = page === 1 ? posts[0] : undefined;
  const list = featured ? posts.slice(1) : posts;
  const articles = `${category.count} ${category.count === 1 ? "article" : "articles"}`;

  return (
    <main className="flex-1 bg-[var(--header-bg)] font-sans">
      <HeroSection
        title={page > 1 ? `${category.name} – Page ${page}` : category.name}
        description={category.description ?? articles}
        image={category.image}
        breadcrumb={[{ label: "Home", href: "/" }, { label: category.name }]}
        headingLevel="h1"
        priority
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {posts.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-sm ring-1 ring-black/5">
              No articles in {category.name} yet. Check back soon.
            </p>
          ) : (
            <>
              {featured && (
                <OverlayPostCard post={featured} label="Latest" headingLevel="h2" priority />
              )}
              {list.map((post) => (
                <HorizontalPostCard key={post.href} post={post} showCategory={false} />
              ))}
            </>
          )}
          <div className="pt-4">
            <Pagination basePath={category.href} current={page} total={totalPages} />
          </div>
        </div>

        <Sidebar />
      </div>
    </main>
  );
}
