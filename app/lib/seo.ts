import type { Metadata } from "next";
import { getSeo } from "./wordpress";

/**
 * Page metadata from the Yoast title and description of the matching WordPress content.
 * Use in a page's generateMetadata, e.g. `return seoMetadata(\`/${slug}/\`)`.
 * Anything Yoast leaves empty falls back to the root layout's defaults.
 */
export async function seoMetadata(uri: string): Promise<Metadata> {
  const seo = await getSeo(uri);
  if (!seo) return {};

  return {
    // Yoast titles already include the site name, so skip the layout's title template.
    ...(seo.title && { title: { absolute: seo.title } }),
    ...(seo.description && { description: seo.description }),
  };
}
