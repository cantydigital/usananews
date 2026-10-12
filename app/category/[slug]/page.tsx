import { getCategorySlugs } from "@/app/lib/wordpress";
import CategoryPage, { categoryMetadata } from "./category-page";

// First page of every category is prerendered; later pages render on first visit, then stay cached.
export async function generateStaticParams() {
  return (await getCategorySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  return categoryMetadata(slug, 1);
}

export default async function Page({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  return <CategoryPage slug={slug} page={1} />;
}
