import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { SITE_URL } from "@/app/lib/site";
import { getPostCategories, getSitemapEntries } from "@/app/lib/wordpress";

/** Latest of a set of ISO dates, or now when there are none. */
function latest(dates: string[]) {
  return dates.reduce((newest, date) => (date > newest ? date : newest), "") || new Date().toISOString();
}

/**
 * /sitemap.xml: the site's own pages, plus every published WordPress page, post and press release, and each
 * category with posts.
 * Built per request rather than at build time, so builds don't need WordPress and new content appears as soon
 * as WordPress's cached data refreshes (within 5 minutes, or straight away via the revalidate webhook).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const [entries, categories] = await Promise.all([getSitemapEntries(), getPostCategories()]);

  const postDates = entries.filter((entry) => entry.kind === "post").map((entry) => entry.lastModified);
  const releaseDates = entries.filter((entry) => entry.kind === "pressRelease").map((entry) => entry.lastModified);
  const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

  return [
    // Pages built in Next.js rather than WordPress; listings change whenever their content does.
    { url: url("/"), lastModified: latest([...postDates, ...releaseDates]), changeFrequency: "daily", priority: 1 },
    { url: url("/news"), lastModified: latest(postDates), changeFrequency: "daily", priority: 0.8 },
    { url: url("/press-releases"), lastModified: latest(releaseDates), changeFrequency: "daily", priority: 0.8 },
    { url: url("/submit-press-release"), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((category) => ({
      url: url(`/category/${category.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...entries.map((entry) => ({
      url: url(entry.path),
      lastModified: entry.lastModified,
      changeFrequency: entry.kind === "page" ? ("monthly" as const) : ("weekly" as const),
      priority: entry.kind === "page" ? 0.6 : 0.7,
    })),
  ];
}
