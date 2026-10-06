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
