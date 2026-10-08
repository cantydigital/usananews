// Server-only: reads credentials from env vars that are never exposed to the browser.

import { unstable_cache } from "next/cache";
import type { NavLink, SocialLink, SocialNetwork } from "@/app/components/header/types";
import { SITE_URL } from "./site";

type QueryOptions = {
  /** Seconds before the cached response is refreshed. */
  revalidate?: number;
  tags?: string[];
};

/**
 * Runs a GraphQL query against WordPress. Only successful results are cached: WPGraphQL
 * reports errors with HTTP 200, which the fetch cache would otherwise store and replay.
 */
export async function wpQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = 300, tags = ["wordpress"] }: QueryOptions = {},
): Promise<T> {
  // Skip the cache in dev so WordPress changes show up immediately.
  if (process.env.NODE_ENV === "development") return requestWordPress<T>(query, variables);

  // A thrown error leaves nothing in the cache, so the next render retries.
  return unstable_cache(
    () => requestWordPress<T>(query, variables),
    ["wordpress-graphql", query, JSON.stringify(variables)],
    { revalidate, tags },
  )();
}

// The WordPress host runs out of database connections ("Error establishing a database
// connection", HTTP 500) at around 20 simultaneous requests, which a parallel build easily
// reaches. Each server process keeps at most this many requests in flight, and retries
// server errors with backoff.
const MAX_CONCURRENT_REQUESTS = 2;
const RETRY_DELAYS_MS = [500, 1500, 3000, 6000];

let activeRequests = 0;
const waitingRequests: (() => void)[] = [];

async function withRequestSlot<T>(run: () => Promise<T>): Promise<T> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
  } else {
    // A finishing request hands its slot straight to the next one in line.
    await new Promise<void>((resolve) => waitingRequests.push(resolve));
  }
  try {
    return await run();
  } finally {
    const next = waitingRequests.shift();
    if (next) next();
    else activeRequests--;
  }
}

/** A failure worth retrying: network errors, rate limiting and 5xx responses. */
class TransientError extends Error {}

async function requestWordPress<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await withRequestSlot(() => sendRequest<T>(query, variables));
    } catch (error) {
      if (!(error instanceof TransientError) || attempt >= RETRY_DELAYS_MS.length) throw error;
      // Wait outside the slot so other requests can use it; jitter spreads out the retries.
      const delay = RETRY_DELAYS_MS[attempt] * (0.75 + Math.random() / 2);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function sendRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const url = process.env.WORDPRESS_GRAPHQL_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  if (!url || !username || !password) {
    throw new Error("WordPress env vars are not configured");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
      },
      body: JSON.stringify({ query, variables }),
      // Caching happens in wpQuery, after the response has been checked for errors.
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new TransientError(`WordPress request failed: ${(error as Error).message}`);
  }

  if (!res.ok) {
    // WordPress explains server errors in a JSON body, e.g. {"message":"<h1>Error establishing…</h1>"}.
    const detail = await res
      .json()
      .then((body: { message?: string }) => body.message?.replace(/<[^>]*>/g, "").trim())
      .catch(() => undefined);
    const message = `WordPress GraphQL request failed: ${res.status}${detail ? ` (${detail})` : ""}`;
    throw res.status >= 500 || res.status === 429 ? new TransientError(message) : new Error(message);
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

type PostSummaryNode = {
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
};

/** Fields every post card needs; spread into any query that returns posts. */
const POST_SUMMARY_FIELDS = /* GraphQL */ `
  fragment PostSummaryFields on Post {
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
`;

/** Turns WordPress HTML (excerpts, captions) into plain text. */
function stripHtml(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, "").replace(/\[&hellip;\]|\[…\]/g, "…")).trim();
}

function toPostSummary(post: PostSummaryNode): PostSummary {
  const image = post.featuredImage?.node;
  return {
    title: clean(post.title) ?? "Untitled",
    // WordPress URIs end in "/"; Next.js serves (and links) paths without it.
    href: post.uri?.replace(/\/+$/, "") || "/",
    excerpt: stripHtml(post.excerpt ?? ""),
    date: post.date,
    commentCount: post.commentCount ?? 0,
    category: clean(post.categories?.nodes[0]?.name),
    author: {
      name: post.author?.node?.name ?? "USANA News",
      avatarUrl: post.author?.node?.avatar?.url ?? null,
    },
    image: image?.sourceUrl
      ? {
          url: image.sourceUrl,
          alt: image.altText || clean(post.title) || "",
          width: image.mediaDetails?.width || 1200,
          height: image.mediaDetails?.height || 800,
        }
      : null,
  };
}

type PostsResponse = { posts: { nodes: PostSummaryNode[] } | null };

const LATEST_POSTS_QUERY = /* GraphQL */ `
  query LatestPosts($first: Int!, $category: String) {
    posts(first: $first, where: { categoryName: $category }) {
      nodes {
        ...PostSummaryFields
      }
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

/**
 * Most recent published posts, newest first, optionally limited to one category slug.
 * Returns [] if WordPress can't be reached.
 */
export async function getLatestPosts(
  first = 4,
  { category }: { category?: string } = {},
): Promise<PostSummary[]> {
  try {
    const data = await wpQuery<PostsResponse>(LATEST_POSTS_QUERY, { first, category: category ?? null }, {
      tags: ["wordpress", "posts"],
    });
    return (data.posts?.nodes ?? []).map(toPostSummary);
  } catch (error) {
    console.warn("Falling back to placeholder posts:", (error as Error).message);
    return [];
  }
}

const SEARCH_POSTS_QUERY = /* GraphQL */ `
  query SearchPosts($search: String!, $first: Int!) {
    posts(first: $first, where: { search: $search }) {
      nodes {
        ...PostSummaryFields
      }
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

/** Posts matching a search term, most relevant first (WordPress search over titles and content). Throws on failure. */
export async function searchPosts(term: string, first = 6): Promise<PostSummary[]> {
  const data = await wpQuery<PostsResponse>(SEARCH_POSTS_QUERY, { search: term, first }, {
    tags: ["wordpress", "posts"],
  });
  return (data.posts?.nodes ?? []).map(toPostSummary);
}

type PopularPicksResponse = {
  siteSettings: {
    siteSettingsFields: {
      mostPopularPosts: { nodes: ({ __typename: string } & Partial<PostSummaryNode>)[] } | null;
    } | null;
  } | null;
};

const POPULAR_PICKS_QUERY = /* GraphQL */ `
  query PopularPicks {
    siteSettings {
      siteSettingsFields {
        mostPopularPosts {
          nodes {
            __typename
            ...PostSummaryFields
          }
        }
      }
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

const MOST_COMMENTED_QUERY = /* GraphQL */ `
  query MostCommented($first: Int!) {
    posts(first: $first, where: { orderby: [{ field: COMMENT_COUNT, order: DESC }, { field: DATE, order: DESC }] }) {
      nodes {
        ...PostSummaryFields
      }
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

/**
 * Posts picked under "Most Popular Posts" in Site Settings, in the editor's order. Tops up with
 * the most-commented posts when fewer are picked. `excludeHref` drops the post being viewed.
 */
export async function getPopularPosts(count = 5, excludeHref?: string): Promise<PostSummary[]> {
  let picks: PostSummary[] = [];
  try {
    const data = await wpQuery<PopularPicksResponse>(POPULAR_PICKS_QUERY, {}, {
      tags: ["wordpress", "site-settings", "posts"],
    });
    const nodes = data.siteSettings?.siteSettingsFields?.mostPopularPosts?.nodes ?? [];
    picks = nodes
      .filter((node): node is PostSummaryNode & { __typename: string } => node.__typename === "Post")
      .map(toPostSummary);
  } catch (error) {
    console.warn("No editor-picked popular posts:", (error as Error).message);
  }

  let fallback: PostSummary[] = [];
  if (picks.filter((p) => p.href !== excludeHref).length < count) {
    try {
      // One extra in case the current post is among them.
      const data = await wpQuery<PostsResponse>(MOST_COMMENTED_QUERY, { first: count + 1 }, {
        tags: ["wordpress", "posts"],
      });
      fallback = (data.posts?.nodes ?? []).map(toPostSummary);
    } catch (error) {
      console.warn("No most-commented posts:", (error as Error).message);
    }
  }

  const seen = new Set(excludeHref ? [excludeHref] : []);
  return [...picks, ...fallback]
    .filter((post) => !seen.has(post.href) && seen.add(post.href))
    .slice(0, count);
}

export type Post = PostSummary & {
  /** Rendered HTML from the block editor. */
  content: string;
  modified: string;
  readingTime: number | null;
  /** Plain-text featured image caption. */
  imageCaption: string | null;
};

export type Page = {
  title: string;
  href: string;
  /** Rendered HTML from the block editor. */
  content: string;
  modified: string;
  image: PostSummary["image"];
  imageCaption: string | null;
  /** Rows of the ACF "Page Content" flexible content field, in the editor's order. */
  sections: PageSection[];
};

export type SectionImage = { url: string; alt: string; width: number; height: number };

/** One flexible content layout, mapped to plain data so the components don't depend on WordPress. */
export type PageSection =
  | { type: "hero"; title: string | null; description: string | null; image: SectionImage | null }
  | { type: "imageWithText"; html: string; image: SectionImage | null; imagePosition: "left" | "right" }
  | { type: "faq"; title: string | null; descriptionHtml: string; items: FaqItem[] }
  | {
      type: "contactForm";
      title: string | null;
      description: string | null;
      /** Server-only: where enquiries are emailed. Never pass these to client components. */
      email: { to: string[]; from: string | null; subject: string | null };
    };

export type FaqItem = {
  question: string;
  /** Answer as HTML from the WYSIWYG field. */
  answerHtml: string;
  /** Answer as plain text, for FAQ structured data. */
  answerText: string;
};

/** What lives at a site path: a post or a page. */
export type Content = { type: "post"; post: Post } | { type: "page"; page: Page };

type ImageNode = {
  sourceUrl: string;
  altText: string | null;
  caption: string | null;
  mediaDetails: { width: number | null; height: number | null } | null;
};

type ContentResponse = {
  nodeByUri:
    | ({ __typename: "Post" } & PostSummaryNode & {
          content: string | null;
          modified: string;
          seo: { readingTime: number | null } | null;
          featuredImage: { node: ImageNode | null } | null;
        })
    | {
        __typename: "Page";
        title: string | null;
        uri: string | null;
        content: string | null;
        modified: string;
        featuredImage: { node: ImageNode | null } | null;
        pageContent: { pageContent: PageSectionNode[] | null } | null;
      }
    | { __typename: string }
    | null;
};

type MediaEdge = { node: Omit<ImageNode, "caption"> | null } | null;

type PageSectionNode =
  | {
      __typename: "PageContentPageContentHeroLayout";
      title: string | null;
      shortDescription: string | null;
      backgroundImage: MediaEdge;
    }
  | {
      __typename: "PageContentPageContentImageWithTextLayout";
      text: string | null;
      imagePosition: string[] | string | null;
      image: MediaEdge;
    }
  | {
      __typename: "PageContentPageContentFrequentlyAskedQuestionsLayout";
      title: string | null;
      shortDescription: string | null;
      faqs: { question: string | null; answer: string | null }[] | null;
    }
  | {
      __typename: "PageContentPageContentContactFormLayout";
      sectionTitle: string | null;
      sectionShortDescription: string | null;
      emailTo: string | null;
      emailFrom: string | null;
      emailSubject: string | null;
    };

const CONTENT_QUERY = /* GraphQL */ `
  query ContentByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      ... on Post {
        ...PostSummaryFields
        content
        modified
        seo {
          readingTime
        }
        featuredImage {
          node {
            caption
          }
        }
      }
      ... on Page {
        title
        uri
        content
        modified
        featuredImage {
          node {
            sourceUrl
            altText
            caption
            mediaDetails {
              width
              height
            }
          }
        }
        pageContent {
          pageContent {
            __typename
            ... on PageContentPageContentHeroLayout {
              title
              shortDescription
              backgroundImage {
                node {
                  ...SectionImageFields
                }
              }
            }
            ... on PageContentPageContentImageWithTextLayout {
              text
              imagePosition
              image {
                node {
                  ...SectionImageFields
                }
              }
            }
            ... on PageContentPageContentFrequentlyAskedQuestionsLayout {
              title
              shortDescription
              faqs {
                question
                answer
              }
            }
            ... on PageContentPageContentContactFormLayout {
              sectionTitle
              sectionShortDescription
              emailTo
              emailFrom
              emailSubject
            }
          }
        }
      }
    }
  }

  fragment SectionImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

function toSectionImage(edge: MediaEdge, fallbackAlt: string): SectionImage | null {
  const image = edge?.node;
  if (!image?.sourceUrl) return null;
  return {
    url: image.sourceUrl,
    alt: image.altText || fallbackAlt,
    width: image.mediaDetails?.width || 1600,
    height: image.mediaDetails?.height || 900,
  };
}

/** Removes empty elements the WYSIWYG editor leaves behind, e.g. "<h3></h3>" or a trailing "<p>". */
function tidyHtml(html: string | null | undefined) {
  return (html ?? "")
    .replace(/<(p|h[1-6]|div|span)\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "")
    .replace(/<p\b[^>]*>\s*$/i, "")
    .trim();
}

/**
 * Maps flexible content rows to sections, keeping the editor's order. To support a new ACF layout,
 * add it to CONTENT_QUERY, PageSectionNode, PageSection and here, then give it a component in
 * app/components/page-sections. Layouts without a mapping are skipped.
 */
function toPageSections(rows: PageSectionNode[] | null | undefined): PageSection[] {
  // Rows of layouts this code doesn't know arrive as { __typename } only, so match on the type name.
  return (rows ?? []).flatMap((row): PageSection[] => {
    switch (row.__typename) {
      case "PageContentPageContentHeroLayout": {
        const title = clean(row.title);
        return [
          {
            type: "hero",
            title,
            description: clean(row.shortDescription),
            image: toSectionImage(row.backgroundImage, title ?? ""),
          },
        ];
      }
      case "PageContentPageContentImageWithTextLayout": {
        // ACF selects arrive as a list of the chosen labels, e.g. ["Left"].
        const position = [row.imagePosition].flat()[0]?.toLowerCase();
        return [
          {
            type: "imageWithText",
            html: tidyHtml(row.text),
            image: toSectionImage(row.image, ""),
            imagePosition: position === "right" ? "right" : "left",
          },
        ];
      }
      case "PageContentPageContentFrequentlyAskedQuestionsLayout":
        return [
          {
            type: "faq",
            title: clean(row.title),
            descriptionHtml: tidyHtml(row.shortDescription),
            items: (row.faqs ?? []).flatMap((faq) => {
              const question = clean(faq.question);
              const answerHtml = tidyHtml(faq.answer);
              return question ? [{ question, answerHtml, answerText: stripHtml(answerHtml) }] : [];
            }),
          },
        ];
      case "PageContentPageContentContactFormLayout":
        return [
          {
            type: "contactForm",
            title: clean(row.sectionTitle),
            description: row.sectionShortDescription ? stripHtml(row.sectionShortDescription) || null : null,
            email: {
              // "Email To" may list several addresses separated by commas.
              to: (row.emailTo ?? "").split(/[,;\s]+/).map((address) => address.trim()).filter(Boolean),
              from: clean(row.emailFrom),
              subject: clean(row.emailSubject),
            },
          },
        ];
      default:
        return [];
    }
  });
}

function captionText(image: { caption: string | null } | null | undefined) {
  return image?.caption ? stripHtml(image.caption) || null : null;
}

/**
 * The post or page at a site path such as "/about-us/", or null when WordPress has nothing there.
 * Throws if WordPress can't be reached, so an outage is never mistaken for a missing page:
 * a build fails instead of prerendering a 404, and a background refresh keeps the last good page.
 */
export async function getContent(uri: string): Promise<Content | null> {
  const data = await wpQuery<ContentResponse>(CONTENT_QUERY, { uri }, {
    tags: ["wordpress", "posts", "pages"],
  });
  const node = data.nodeByUri;

  if (node && node.__typename === "Post" && "content" in node && "excerpt" in node) {
    return {
      type: "post",
      post: {
        ...toPostSummary(node),
        content: node.content ?? "",
        modified: node.modified,
        readingTime: node.seo?.readingTime || null,
        imageCaption: captionText(node.featuredImage?.node),
      },
    };
  }

  if (node && node.__typename === "Page" && "content" in node) {
    const image = node.featuredImage?.node;
    const title = clean(node.title) ?? "Untitled";
    return {
      type: "page",
      page: {
        title,
        href: node.uri?.replace(/\/+$/, "") || "/",
        content: node.content ?? "",
        modified: node.modified,
        image: image?.sourceUrl
          ? {
              url: image.sourceUrl,
              alt: image.altText || title,
              width: image.mediaDetails?.width || 1600,
              height: image.mediaDetails?.height || 900,
            }
          : null,
        imageCaption: captionText(image),
        sections: toPageSections("pageContent" in node ? node.pageContent?.pageContent : null),
      },
    };
  }

  // Categories, tags and other archives don't have routes yet.
  return null;
}

type PrerenderPathsResponse = {
  posts: { nodes: { uri: string | null }[] } | null;
  pages: { nodes: { uri: string | null; isFrontPage: boolean }[] } | null;
};

/** URL segments of recent posts and all pages, for prerendering at build time. */
export async function getPrerenderPaths(): Promise<string[][]> {
  try {
    const data = await wpQuery<PrerenderPathsResponse>(
      /* GraphQL */ `
        query PrerenderPaths {
          posts(first: 50) {
            nodes {
              uri
            }
          }
          pages(first: 100) {
            nodes {
              uri
              isFrontPage
            }
          }
        }
      `,
      {},
      { tags: ["wordpress", "posts", "pages"] },
    );
    const pages = (data.pages?.nodes ?? []).filter((page) => !page.isFrontPage);
    return [...(data.posts?.nodes ?? []), ...pages]
      .map((node) => (node.uri ?? "").split("/").filter(Boolean))
      .filter((segments) => segments.length > 0);
  } catch (error) {
    console.warn("No paths to prerender:", (error as Error).message);
    return [];
  }
}

export type Category = {
  name: string;
  slug: string;
  href: string;
  description: string | null;
  /** Number of published posts. */
  count: number;
  /** ACF "Category Image", shown in the category page's hero. */
  image: SectionImage | null;
};

type CategoryResponse = {
  category: {
    name: string | null;
    slug: string;
    uri: string | null;
    description: string | null;
    count: number | null;
    categoryField: { categoryImage: MediaEdge } | null;
  } | null;
};

const CATEGORY_QUERY = /* GraphQL */ `
  query Category($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      name
      slug
      uri
      description
      count
      categoryField {
        categoryImage {
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

/**
 * A category by slug, or null when WordPress has no such category.
 * Throws if WordPress can't be reached, so an outage is never shown as a 404.
 */
export async function getCategory(slug: string): Promise<Category | null> {
  const data = await wpQuery<CategoryResponse>(CATEGORY_QUERY, { slug }, {
    tags: ["wordpress", "categories"],
  });
  const category = data.category;
  if (!category) return null;
  return {
    name: clean(category.name) ?? category.slug,
    slug: category.slug,
    href: category.uri?.replace(/\/+$/, "") || `/category/${category.slug}`,
    description: category.description ? stripHtml(category.description) || null : null,
    count: category.count ?? 0,
    image: toSectionImage(category.categoryField?.categoryImage ?? null, clean(category.name) ?? ""),
  };
}

const CATEGORY_CURSOR_QUERY = /* GraphQL */ `
  query CategoryCursor($category: String!, $first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { categoryName: $category }) {
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const CATEGORY_POSTS_QUERY = /* GraphQL */ `
  query CategoryPosts($category: String!, $first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { categoryName: $category }) {
      nodes {
        ...PostSummaryFields
      }
    }
  }
  ${POST_SUMMARY_FIELDS}
`;

type CursorResponse = { posts: { pageInfo: { endCursor: string | null; hasNextPage: boolean } } | null };

// WPGraphQL returns at most 100 items per request.
const MAX_PAGE_SIZE = 100;

/**
 * One page of a category's posts, newest first (page numbers start at 1).
 * WPGraphQL only pages by cursor, so earlier pages are skipped by walking cursors in cached steps.
 * Throws if WordPress can't be reached.
 */
export async function getCategoryPosts(category: string, page: number, perPage: number): Promise<PostSummary[]> {
  const tags = ["wordpress", "posts", "categories"];
  let after: string | null = null;

  for (let skip = (page - 1) * perPage; skip > 0; ) {
    const first = Math.min(skip, MAX_PAGE_SIZE);
    const data: CursorResponse = await wpQuery<CursorResponse>(CATEGORY_CURSOR_QUERY, { category, first, after }, { tags });
    const info = data.posts?.pageInfo;
    // Nothing after the skipped posts means the page is past the end.
    if (!info?.endCursor || !info.hasNextPage) return [];
    after = info.endCursor;
    skip -= first;
  }

  const data = await wpQuery<PostsResponse>(CATEGORY_POSTS_QUERY, { category, first: perPage, after }, { tags });
  return (data.posts?.nodes ?? []).map(toPostSummary);
}

/** Slugs of all categories, for prerendering their first page. */
export async function getCategorySlugs(): Promise<string[]> {
  try {
    const data = await wpQuery<{ categories: { nodes: { slug: string }[] } | null }>(
      /* GraphQL */ `
        query CategorySlugs {
          categories(first: 100) {
            nodes {
              slug
            }
          }
        }
      `,
      {},
      { tags: ["wordpress", "categories"] },
    );
    return (data.categories?.nodes ?? []).map((category) => category.slug);
  } catch (error) {
    console.warn("No category slugs to prerender:", (error as Error).message);
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

export type SeoMeta = {
  title: string | null;
  description: string | null;
};

type YoastFields = { title: string | null; metaDesc: string | null } | null;

type SeoResponse = {
  nodeByUri:
    | { __typename: "ContentType"; isFrontPage: boolean }
    | { __typename: string; seo?: YoastFields }
    | null;
  seo: { meta: { homepage: { title: string | null; description: string | null } | null } | null } | null;
};

const SEO_QUERY = /* GraphQL */ `
  query Seo($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      ... on ContentType {
        isFrontPage
      }
      ... on Page {
        seo {
          title
          metaDesc
        }
      }
      ... on Post {
        seo {
          title
          metaDesc
        }
      }
      ... on Category {
        seo {
          title
          metaDesc
        }
      }
      ... on Tag {
        seo {
          title
          metaDesc
        }
      }
    }
    seo {
      meta {
        homepage {
          title
          description
        }
      }
    }
  }
`;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

/** Decodes the HTML entities WordPress leaves in titles, e.g. "&#8211;" and "&amp;". */
function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? match;
    const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isNaN(n) ? match : String.fromCodePoint(n);
  });
}

function clean(value: string | null | undefined) {
  const text = value ? decodeEntities(value).trim() : "";
  return text || null;
}

/**
 * Yoast title and meta description for a site path, e.g. "/" or "/hello-world/".
 * The homepage uses Yoast's Homepage settings when WordPress shows latest posts on the front page.
 * Returns null if nothing in WordPress matches the path or WordPress can't be reached.
 */
export async function getSeo(uri: string): Promise<SeoMeta | null> {
  try {
    const data = await wpQuery<SeoResponse>(SEO_QUERY, { uri }, {
      tags: ["wordpress", "seo"],
    });
    const node = data.nodeByUri;
    if (!node) return null;

    if (node.__typename === "ContentType") {
      if (!("isFrontPage" in node) || !node.isFrontPage) return null;
      const home = data.seo?.meta?.homepage;
      return { title: clean(home?.title), description: clean(home?.description) };
    }

    const seo = "seo" in node ? node.seo : null;
    if (!seo) return null;
    return { title: clean(seo.title), description: clean(seo.metaDesc) };
  } catch (error) {
    console.warn(`No SEO data for ${uri}:`, (error as Error).message);
    return null;
  }
}

type SiteInfoResponse = {
  generalSettings: { title: string | null; description: string | null } | null;
};

const SITE_INFO_QUERY = /* GraphQL */ `
  query SiteInfo {
    generalSettings {
      title
      description
    }
  }
`;

/** Site Title and Tagline from WordPress Settings → General, or null if unavailable. */
export async function getSiteInfo(): Promise<{ name: string; tagline: string | null } | null> {
  try {
    const data = await wpQuery<SiteInfoResponse>(SITE_INFO_QUERY, {}, {
      tags: ["wordpress", "site-settings"],
    });
    const name = clean(data.generalSettings?.title);
    return name ? { name, tagline: clean(data.generalSettings?.description) } : null;
  } catch (error) {
    console.warn("No site info:", (error as Error).message);
    return null;
  }
}

export type FeaturedCategory = {
  label: string;
  /** WordPress category slug. */
  slug: string;
};

type FeaturedCategoriesResponse = {
  homepageSettings: {
    homepageSettingsFields: {
      featuredCategories: {
        nodes: { __typename: string; name: string | null; slug: string | null }[];
      } | null;
    } | null;
  } | null;
};

const FEATURED_CATEGORIES_QUERY = /* GraphQL */ `
  query FeaturedCategories {
    homepageSettings {
      homepageSettingsFields {
        featuredCategories {
          nodes {
            __typename
            name
            slug
          }
        }
      }
    }
  }
`;

/**
 * Categories picked under "Featured Categories" on the ACF "Homepage Settings" options page, in order.
 * Returns null if none are set or WordPress can't be reached.
 */
export async function getFeaturedCategories(): Promise<FeaturedCategory[] | null> {
  try {
    const data = await wpQuery<FeaturedCategoriesResponse>(FEATURED_CATEGORIES_QUERY, {}, {
      tags: ["wordpress", "homepage-settings"],
    });
    const nodes = data.homepageSettings?.homepageSettingsFields?.featuredCategories?.nodes ?? [];
    // The field can link any taxonomy; only categories can filter posts by categoryName.
    const categories = nodes.flatMap((node) =>
      node.__typename === "Category" && node.name && node.slug
        ? [{ label: clean(node.name) ?? node.name, slug: node.slug }]
        : [],
    );
    return categories.length ? categories : null;
  } catch (error) {
    console.warn("Falling back to default featured categories:", (error as Error).message);
    return null;
  }
}

/** Menu locations registered in WordPress with register_nav_menus(). */
export type MenuLocation = "HEADER_MENU" | "FOOTER_MENU" | "LEGAL_MENU";

export type MenuItem = NavLink & { children: MenuItem[] };

type MenuItemsResponse = {
  menuItems: {
    nodes: {
      id: string;
      parentId: string | null;
      label: string | null;
      url: string | null;
      target: string | null;
    }[];
  } | null;
};

const MENU_ITEMS_QUERY = /* GraphQL */ `
  query MenuItems($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 200) {
      nodes {
        id
        parentId
        label
        url
        target
      }
    }
  }
`;

/**
 * Turns a menu item URL into a site link: WordPress and front-end URLs become paths
 * ("https://wpbacked…/about-us/" → "/about-us"), external URLs and "#" stay as they are.
 */
function toSiteHref(url: string | null) {
  if (!url || url.startsWith("#")) return url || "#";
  try {
    const target = new URL(url, SITE_URL);
    const internal = [SITE_URL, process.env.WORDPRESS_GRAPHQL_URL ?? ""].some(
      (base) => base && new URL(base).hostname.replace(/^www\./, "") === target.hostname.replace(/^www\./, ""),
    );
    if (!internal) return url;
    return (target.pathname.replace(/\/+$/, "") || "/") + target.search + target.hash;
  } catch {
    return url;
  }
}

/**
 * Items of the menu assigned to a location in Appearance → Menus, nested by parent.
 * Returns null if no menu is assigned, the location isn't registered, or WordPress can't be reached.
 */
export async function getMenu(location: MenuLocation): Promise<MenuItem[] | null> {
  try {
    const data = await wpQuery<MenuItemsResponse>(MENU_ITEMS_QUERY, { location }, {
      tags: ["wordpress", "menus"],
    });
    const nodes = data.menuItems?.nodes ?? [];
    if (nodes.length === 0) return null;

    // WordPress returns items flat and in menu order; rebuild the tree from parentId.
    const items = new Map<string, MenuItem>();
    for (const node of nodes) {
      items.set(node.id, {
        label: clean(node.label) ?? "",
        href: toSiteHref(node.url),
        newTab: node.target === "_blank",
        children: [],
      });
    }
    const roots: MenuItem[] = [];
    for (const node of nodes) {
      const item = items.get(node.id)!;
      const parent = node.parentId ? items.get(node.parentId) : undefined;
      (parent ? parent.children : roots).push(item);
    }
    return roots;
  } catch (error) {
    console.warn(`No ${location} menu:`, (error as Error).message);
    return null;
  }
}

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Saves a contact form enquiry as a private "Contact Submission" post via the WordPress REST API.
 * Uses WORDPRESS_FORMS_USERNAME / WORDPRESS_FORMS_APP_PASSWORD when set (a low-privilege user is
 * recommended), otherwise the main WordPress credentials. Throws if the save fails.
 */
export async function saveContactSubmission(submission: ContactSubmission): Promise<void> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  const username = process.env.WORDPRESS_FORMS_USERNAME ?? process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_FORMS_APP_PASSWORD ?? process.env.WORDPRESS_APP_PASSWORD;
  if (!endpoint || !username || !password) throw new Error("WordPress env vars are not configured");

  // Store the message as escaped text so a visitor can never inject HTML into WP Admin.
  const content = submission.message
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  const res = await fetch(`${new URL(endpoint).origin}/wp-json/wp/v2/contact-submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: JSON.stringify({
      title: `${submission.name} – ${submission.subject}`,
      content,
      status: "private",
      meta: {
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        subject: submission.subject,
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Saving contact submission failed: ${res.status} ${detail.slice(0, 200)}`);
  }
}

/**
 * Footer Disclaimer (WYSIWYG HTML) from Site Settings, or null if it's empty
 * or WordPress can't be reached.
 */
export async function getFooterDisclaimer(): Promise<string | null> {
  try {
    const data = await wpQuery<{ siteSettings: { siteSettingsFields: { footerDisclaimer: string | null } | null } | null }>(
      /* GraphQL */ `
        query FooterDisclaimer {
          siteSettings {
            siteSettingsFields {
              footerDisclaimer
            }
          }
        }
      `,
      {},
      { tags: ["wordpress", "site-settings"] },
    );
    return tidyHtml(data.siteSettings?.siteSettingsFields?.footerDisclaimer) || null;
  } catch (error) {
    console.warn("Falling back to default footer disclaimer:", (error as Error).message);
    return null;
  }
}

export type HomepageCta = {
  topText: string | null;
  title: string;
  description: string | null;
  button: { label: string; href: string } | null;
};

type HomepageCtaResponse = {
  homepageSettings: {
    homepageSettingsFields: {
      showHomepageCtaBox: boolean | null;
      cta: {
        ctaTopText: string | null;
        ctaTitleText: string | null;
        ctaDescription: string | null;
        ctaButtonText: string | null;
        ctaButtonUrl: string | null;
      } | null;
    } | null;
  } | null;
};

/**
 * The homepage CTA box from Homepage Settings. Returns null when "Show Homepage CTA Box" is
 * unticked, the title is empty, or WordPress can't be reached, so the box is simply left out.
 */
export async function getHomepageCta(): Promise<HomepageCta | null> {
  try {
    const data = await wpQuery<HomepageCtaResponse>(
      /* GraphQL */ `
        query HomepageCta {
          homepageSettings {
            homepageSettingsFields {
              showHomepageCtaBox
              cta {
                ctaTopText
                ctaTitleText
                ctaDescription
                ctaButtonText
                ctaButtonUrl
              }
            }
          }
        }
      `,
      {},
      { tags: ["wordpress", "homepage-settings"] },
    );
    const fields = data.homepageSettings?.homepageSettingsFields;
    const cta = fields?.cta;
    const title = clean(cta?.ctaTitleText);
    if (!fields?.showHomepageCtaBox || !title) return null;

    const label = clean(cta?.ctaButtonText);
    const url = cta?.ctaButtonUrl?.trim();
    return {
      topText: clean(cta?.ctaTopText),
      title,
      description: cta?.ctaDescription ? stripHtml(cta.ctaDescription) || null : null,
      // Links to this site become paths, so they open in the same tab.
      button: label && url ? { label, href: toSiteHref(url) } : null,
    };
  } catch (error) {
    console.warn("Hiding homepage CTA box:", (error as Error).message);
    return null;
  }
}
