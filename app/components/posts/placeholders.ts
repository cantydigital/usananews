import type { PostSummary } from "@/app/lib/wordpress";

const author = { name: "USANA News", avatarUrl: null };

/** Fills empty post slots until WordPress has enough published posts. */
export const placeholderPosts: PostSummary[] = [
  {
    title: "What the latest research says about probiotics and gut health",
    href: "/gut-supps",
    excerpt: "Not every strain does the same job. Here's how to read the label before you buy.",
    date: "2026-10-06T09:00:00",
    commentCount: 0,
    category: "Gut Supps",
    author,
    image: null,
  },
  {
    title: "Omega-3 and memory: separating the evidence from the hype",
    href: "/brain-supps",
    excerpt: "",
    date: "2026-10-05T09:00:00",
    commentCount: 0,
    category: "Brain Supps",
    author,
    image: null,
  },
  {
    title: "Glucosamine vs collagen: which one supports your joints?",
    href: "/joint-supps",
    excerpt: "",
    date: "2026-10-04T09:00:00",
    commentCount: 0,
    category: "Joint Supps",
    author,
    image: null,
  },
  {
    title: "Iron, folate and B12: the nutrients women most often miss",
    href: "/womens-health",
    excerpt: "",
    date: "2026-10-03T09:00:00",
    commentCount: 0,
    category: "Women's Health",
    author,
    image: null,
  },
  {
    title: "CoQ10, collagen and NAD+: what anti-ageing supplements can and can't do",
    href: "/anti-aging-supps",
    excerpt: "",
    date: "2026-10-02T09:00:00",
    commentCount: 0,
    category: "Anti-Aging Supps",
    author,
    image: null,
  },
  {
    title: "Berberine and blood sugar: what the studies actually show",
    href: "/metabolic-supps",
    excerpt: "",
    date: "2026-10-01T09:00:00",
    commentCount: 0,
    category: "Metabolic Supps",
    author,
    image: null,
  },
  {
    title: "Psyllium, inulin or guar gum? Fibre supplements compared",
    href: "/gut-supps",
    excerpt: "",
    date: "2026-09-30T09:00:00",
    commentCount: 0,
    category: "Gut Supps",
    author,
    image: null,
  },
  {
    title: "Magnesium for sleep: does the form you take matter?",
    href: "/brain-supps",
    excerpt: "",
    date: "2026-09-29T09:00:00",
    commentCount: 0,
    category: "Brain Supps",
    author,
    image: null,
  },
];

/** Tops `posts` up to `count` with placeholders, using ones from `category` first when given. */
export function fillWithPlaceholders(
  posts: PostSummary[],
  count: number,
  category?: string,
): PostSummary[] {
  const placeholders = category
    ? [
        ...placeholderPosts.filter((p) => p.category === category),
        ...placeholderPosts.filter((p) => p.category !== category),
      ]
    : placeholderPosts;
  return [...posts, ...placeholders].slice(0, count);
}
