import { permanentRedirect } from "next/navigation";
import CategoryPage, { categoryMetadata, parsePage } from "../../category-page";

// /category/x/page/2 and onwards; page 1 lives at /category/x.
// None are prerendered: each renders on first visit, then stays cached like the other pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]/page/[page]">) {
  const { slug, page } = await params;
  return categoryMetadata(slug, parsePage(page));
}

export default async function Page({ params }: PageProps<"/category/[slug]/page/[page]">) {
  const { slug, page } = await params;
  const pageNumber = parsePage(page);
  if (pageNumber === 1) permanentRedirect(`/category/${slug}`);
  return <CategoryPage slug={slug} page={pageNumber} />;
}
