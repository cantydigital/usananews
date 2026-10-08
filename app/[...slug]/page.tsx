import { notFound } from "next/navigation";
import { PageArticle, PostArticle } from "@/app/components/content";
import { seoMetadata } from "@/app/lib/seo";
import { getContent, getPrerenderPaths } from "@/app/lib/wordpress";

// Serves every WordPress post and page by its path, e.g. /magnesium-for-sleep or /about-us.
// Recent posts and all pages are prerendered; anything newer renders on first visit, then stays cached.
export async function generateStaticParams() {
  return (await getPrerenderPaths()).map((slug) => ({ slug }));
}

/** WordPress path for the URL segments, e.g. ["about-us"] → "/about-us/". */
function toUri(slug: string[]) {
  return `/${slug.map(encodeURIComponent).join("/")}/`;
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  return seoMetadata(toUri(slug));
}

export default async function ContentPage({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const content = await getContent(toUri(slug));
  if (!content) notFound();

  return content.type === "post" ? <PostArticle post={content.post} /> : <PageArticle page={content.page} />;
}
