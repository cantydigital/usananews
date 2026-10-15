import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { SITE_URL } from "@/app/lib/site";
import { getSiteIndexable } from "@/app/lib/wordpress";

/**
 * /robots.txt, following "Site Indexing Status" in WordPress Site Settings (as the pages' robots meta tag does):
 * when indexing is off, crawlers are kept out entirely. Built per request, so a change in WordPress applies
 * without a redeploy.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const indexable = await getSiteIndexable();

  return {
    rules: indexable
      ? // API routes are for the site's own forms and webhooks, not pages.
        { userAgent: "*", allow: "/", disallow: "/api/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
