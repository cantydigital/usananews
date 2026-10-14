import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/app/components/content";
import PressReleaseListItem from "@/app/components/press-release/PressReleaseListItem";
import { parseListingFilters } from "@/app/lib/listing";
import { getPressReleaseListing, getSubmissionCategories, type PressReleaseListing } from "@/app/lib/wordpress";

const PER_PAGE = 10;

export async function generateMetadata({ searchParams }: PageProps<"/press-releases">): Promise<Metadata> {
  const { page } = parseListingFilters(await searchParams);
  return {
    title: page > 1 ? `All Press Releases – Page ${page}` : "All Press Releases",
    description:
      "Browse all published press releases from businesses, organisations and agencies across Australia.",
  };
}

export default async function PressReleasesPage({ searchParams }: PageProps<"/press-releases">) {
  const filters = parseListingFilters(await searchParams);
  const categories = await getSubmissionCategories().catch((error: Error) => {
    console.warn("Press release category filter unavailable:", error.message);
    return [];
  });
  const categoryId = categories.find((c) => c.slug === filters.category)?.id;

  const listing: PressReleaseListing | null = await getPressReleaseListing({
    page: filters.page,
    perPage: PER_PAGE,
    search: filters.search || undefined,
    categoryId,
    sort: filters.sort,
  }).catch((error: Error) => {
    console.error("Press releases unavailable:", error.message);
    return null;
  });

  // A page past the end, e.g. from an old link after releases were removed.
  if (listing && listing.releases.length === 0 && filters.page > 1) notFound();

  return (
    <ListingPage
      eyebrow="Press Releases"
      title="All Press Releases"
      description="Browse all published press releases from businesses, organisations and agencies across Australia. Stay updated with the latest news and announcements."
      note="Latest press releases from trusted sources"
      basePath="/press-releases"
      noun="press releases"
      categories={categories}
      filters={filters}
      hasCategory={categoryId !== undefined}
      results={listing && { count: listing.releases.length, total: listing.total, totalPages: listing.totalPages }}
      perPage={PER_PAGE}
    >
      <ul className="flex flex-col gap-5">
        {listing?.releases.map((release, i) => (
          <li key={release.href}>
            <PressReleaseListItem release={release} readMoreLabel="Read Full Release" headingLevel="h2" priority={i < 2} />
          </li>
        ))}
      </ul>
    </ListingPage>
  );
}
