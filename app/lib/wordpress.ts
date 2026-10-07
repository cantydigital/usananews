// Server-only: reads credentials from env vars that are never exposed to the browser.

import type { SocialLink, SocialNetwork } from "@/app/components/header/types";

type QueryOptions = {
  /** Seconds before the cached response is refreshed. */
  revalidate?: number;
  tags?: string[];
};

export async function wpQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = 300, tags = ["wordpress"] }: QueryOptions = {},
): Promise<T> {
  const url = process.env.WORDPRESS_GRAPHQL_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  if (!url || !username || !password) {
    throw new Error("WordPress env vars are not configured");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: JSON.stringify({ query, variables }),
    // Skip the data cache in dev so WordPress changes show up immediately.
    next: { revalidate: process.env.NODE_ENV === "development" ? 0 : revalidate, tags },
  });

  if (!res.ok) {
    throw new Error(`WordPress GraphQL request failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data as T;
}

export type SiteLogo = {
  url: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
};

type SiteLogoResponse = {
  siteSettings: {
    siteSettingsFields: {
      siteLogo: {
        node: {
          sourceUrl: string;
          altText: string | null;
          mimeType: string | null;
          mediaDetails: { width: number | null; height: number | null } | null;
        } | null;
      } | null;
    } | null;
  } | null;
};

const SITE_LOGO_QUERY = /* GraphQL */ `
  query SiteLogo {
    siteSettings {
      siteSettingsFields {
        siteLogo {
          node {
            sourceUrl
            altText
            mimeType
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

/** Site logo from the ACF "Site Settings" options page, or null if unavailable. */
export async function getSiteLogo(): Promise<SiteLogo | null> {
  try {
    const data = await wpQuery<SiteLogoResponse>(SITE_LOGO_QUERY, {}, {
      tags: ["wordpress", "site-settings"],
    });
    const node = data.siteSettings?.siteSettingsFields?.siteLogo?.node;
    if (!node?.sourceUrl) return null;

    return {
      url: node.sourceUrl,
      alt: node.altText || "Site logo",
      // SVGs often report no dimensions; fall back to the header's logo box.
      width: node.mediaDetails?.width || 120,
      height: node.mediaDetails?.height || 50,
      mimeType: node.mimeType ?? "",
    };
  } catch (error) {
    console.warn("Falling back to placeholder logo:", (error as Error).message);
    return null;
  }
}

type AnnouncementsResponse = {
  siteSettings: {
    siteSettingsFields: {
      announcements: { title: string | null }[] | null;
    } | null;
  } | null;
};

const ANNOUNCEMENTS_QUERY = /* GraphQL */ `
  query Announcements {
    siteSettings {
      siteSettingsFields {
        announcements {
          title
        }
      }
    }
  }
`;

/**
 * Announcement titles from the ACF "Site Settings" repeater.
 * Returns null if WordPress can't be reached, and [] if the repeater is empty.
 */
export async function getAnnouncements(): Promise<string[] | null> {
  try {
    const data = await wpQuery<AnnouncementsResponse>(ANNOUNCEMENTS_QUERY, {}, {
      tags: ["wordpress", "site-settings"],
    });
    const rows = data.siteSettings?.siteSettingsFields?.announcements ?? [];
    return rows.map((row) => row.title?.trim() ?? "").filter(Boolean);
  } catch (error) {
    console.warn("Falling back to default announcements:", (error as Error).message);
    return null;
  }
}

type SocialLinksResponse = {
  siteSettings: {
    siteSettingsFields: {
      socialLinks: Partial<Record<`${SocialNetwork}Link`, string | null>> | null;
    } | null;
  } | null;
};

const SOCIAL_LINKS_QUERY = /* GraphQL */ `
  query SocialLinks {
    siteSettings {
      siteSettingsFields {
        socialLinks {
          facebookLink
          instagramLink
          youtubeLink
          linkedinLink
          xLink
        }
      }
    }
  }
`;

// Display order in the header.
const SOCIAL_NETWORKS: SocialNetwork[] = ["facebook", "instagram", "youtube", "linkedin", "x"];

/** Social links from the ACF "Site Settings" group; only networks with a valid URL are returned. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const data = await wpQuery<SocialLinksResponse>(SOCIAL_LINKS_QUERY, {}, {
      tags: ["wordpress", "site-settings"],
    });
    const links = data.siteSettings?.siteSettingsFields?.socialLinks ?? {};

    return SOCIAL_NETWORKS.flatMap((network) => {
      const href = links[`${network}Link`]?.trim();
      // Only allow web URLs so a bad value can't become a javascript: link.
      return href && /^https?:\/\//i.test(href) ? [{ network, href }] : [];
    });
  } catch (error) {
    console.warn("Hiding social links:", (error as Error).message);
    return [];
  }
}

export type PostSummary = {
  title: string;
  href: string;
  excerpt: string;
  date: string;
  commentCount: number;
  category: string | null;
  author: { name: string; avatarUrl: string | null };
  image: { url: string; alt: string; width: number; height: number } | null;
};

type LatestPostsResponse = {
  posts: {
    nodes: {
      title: string | null;
      uri: string | null;
      excerpt: string | null;
      date: string;
      commentCount: number | null;
      categories: { nodes: { name: string }[] } | null;
      author: { node: { name: string | null; avatar: { url: string | null } | null } | null } | null;
      featuredImage: {
        node: {
          sourceUrl: string;
          altText: string | null;
          mediaDetails: { width: number | null; height: number | null } | null;
        } | null;
      } | null;
    }[];
  } | null;
};

const LATEST_POSTS_QUERY = /* GraphQL */ `
  query LatestPosts($first: Int!, $category: String) {
    posts(first: $first, where: { categoryName: $category }) {
      nodes {
        title
        uri
        excerpt
        date
        commentCount
        categories(first: 1) {
          nodes {
            name
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

/** Turns a WordPress HTML excerpt into plain text. */
function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8217;/g, "’")
    .replace(/&#8230;|\[&hellip;\]|&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Most recent published posts, newest first, optionally limited to one category slug.
 * Returns [] if WordPress can't be reached.
 */
export async function getLatestPosts(
  first = 4,
  { category }: { category?: string } = {},
): Promise<PostSummary[]> {
  try {
    const data = await wpQuery<LatestPostsResponse>(LATEST_POSTS_QUERY, { first, category: category ?? null }, {
      tags: ["wordpress", "posts"],
    });

    return (data.posts?.nodes ?? []).map((post) => {
      const image = post.featuredImage?.node;
      return {
        title: post.title ?? "Untitled",
        href: post.uri ?? "/",
        excerpt: stripHtml(post.excerpt ?? ""),
        date: post.date,
        commentCount: post.commentCount ?? 0,
        category: post.categories?.nodes[0]?.name ?? null,
        author: {
          name: post.author?.node?.name ?? "USANA News",
          avatarUrl: post.author?.node?.avatar?.url ?? null,
        },
        image: image?.sourceUrl
          ? {
              url: image.sourceUrl,
              alt: image.altText || post.title || "",
              width: image.mediaDetails?.width || 1200,
              height: image.mediaDetails?.height || 800,
            }
          : null,
      };
    });
  } catch (error) {
    console.warn("Falling back to placeholder posts:", (error as Error).message);
    return [];
  }
}

type SiteIndexingResponse = {
  siteSettings: {
    siteSettingsFields: {
      siteIndexingStatus: string[] | null;
    } | null;
  } | null;
};

const SITE_INDEXING_QUERY = /* GraphQL */ `
  query SiteIndexing {
    siteSettings {
      siteSettingsFields {
        siteIndexingStatus
      }
    }
  }
`;

/**
 * Whether search engines may index the site, from the ACF "Site Indexing Status" select.
 * Any "No Index"-style choice (e.g. "No Indexed", "noindex") blocks indexing.
 * Returns true if the field is empty or WordPress can't be reached, so an outage can't de-index the site.
 */
export async function getSiteIndexable(): Promise<boolean> {
  try {
    const data = await wpQuery<SiteIndexingResponse>(SITE_INDEXING_QUERY, {}, {
      tags: ["wordpress", "site-settings"],
    });
    const status = data.siteSettings?.siteSettingsFields?.siteIndexingStatus?.[0] ?? "";
    // Match the choice whether ACF returns its label or its value.
    return !status.toLowerCase().replace(/[^a-z]/g, "").startsWith("no");
  } catch (error) {
    console.warn("Falling back to indexable:", (error as Error).message);
    return true;
  }
}
