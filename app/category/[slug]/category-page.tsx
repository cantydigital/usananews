import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryArchive } from "@/app/components/content";
import { seoMetadata } from "@/app/lib/seo";
import { getCategory, getCategoryPosts } from "@/app/lib/wordpress";

// Matches WordPress Settings → Reading → "Blog pages show at most".
export const POSTS_PER_PAGE = 10;

/** Parses "/page/N"; anything that isn't a whole number from 1 up is a 404. */
export function parsePage(value: string) {
  if (!/^[1-9]\d*$/.test(value)) notFound();
  return Number(value);
}

/** Yoast title and description for the category, with "Page N" added after the first page. */
export async function categoryMetadata(slug: string, page: number): Promise<Metadata> {
  const metadata = await seoMetadata(`/category/${slug}/`);
  if (page <= 1) return metadata;
  const title = typeof metadata.title === "object" && metadata.title && "absolute" in metadata.title ? metadata.title.absolute : null;
  return { ...metadata, title: title ? { absolute: `${title} – Page ${page}` } : `Page ${page}` };
}

/** Loads one page of a category and renders it, or 404s for unknown categories and pages past the end. */
export default async function CategoryPage({ slug, page }: { slug: string; page: number }) {
  const category = await getCategory(slug);
  if (!category) notFound();

  const totalPages = Math.max(1, Math.ceil(category.count / POSTS_PER_PAGE));
  if (page > totalPages) notFound();

  const posts = await getCategoryPosts(category.slug, page, POSTS_PER_PAGE);
  return <CategoryArchive category={category} posts={posts} page={page} totalPages={totalPages} />;
}
