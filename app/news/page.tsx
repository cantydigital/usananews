import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/app/components/content";
import { PostCard } from "@/app/components/posts";
import { parseListingFilters } from "@/app/lib/listing";
import { getNewsListing, getPostCategories, type NewsListing } from "@/app/lib/wordpress";

// Divides evenly into the grid's 2, 3 and 4 columns.
const PER_PAGE = 12;

export async function generateMetadata({ searchParams }: PageProps<"/news">): Promise<Metadata> {
  const { page } = parseListingFilters(await searchParams);
  return {
    title: page > 1 ? `All News – Page ${page}` : "All News",
    description: "Browse every USANA News article: supplement research, health news and guides, explained in plain English.",
  };
}

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const filters = parseListingFilters(await searchParams);
  const categories = await getPostCategories().catch((error: Error) => {
    console.warn("News category filter unavailable:", error.message);
    return [];
  });
  const categoryId = categories.find((c) => c.slug === filters.category)?.id;

  const listing: NewsListing | null = await getNewsListing({
    page: filters.page,
    perPage: PER_PAGE,
    search: filters.search || undefined,
    categoryId,
    sort: filters.sort,
  }).catch((error: Error) => {
    console.error("News unavailable:", error.message);
    return null;
  });

  // A page past the end, e.g. from an old link after posts were removed.
  if (listing && listing.posts.length === 0 && filters.page > 1) notFound();

  return (
    <ListingPage
      eyebrow="News"
      title="All News"
      description="Browse every article from USANA News: the latest supplement research, health news and guides, explained in plain English."
      note="Evidence-based news and research"
      basePath="/news"
      noun="articles"
      categories={categories}
      filters={filters}
      hasCategory={categoryId !== undefined}
      results={listing && { count: listing.posts.length, total: listing.total, totalPages: listing.totalPages }}
      perPage={PER_PAGE}
      width="wide"
    >
      {/* Same cards and grid as the homepage's Top Stories */}
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listing?.posts.map((post) => (
          <PostCard
            key={post.href}
            post={post}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ))}
      </div>
    </ListingPage>
  );
}
