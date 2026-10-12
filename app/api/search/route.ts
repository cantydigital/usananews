import type { NextRequest } from "next/server";
import { searchPosts } from "@/app/lib/wordpress";

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

/** Search suggestions for the header search popup: GET /api/search?q=magnesium → { posts }. */
export async function GET(request: NextRequest) {
  // Normalise so "Magnesium " and "magnesium" share a cache entry.
  const term = (request.nextUrl.searchParams.get("q") ?? "").trim().replace(/\s+/g, " ").toLowerCase().slice(0, MAX_LENGTH);
  if (term.length < MIN_LENGTH) return Response.json({ posts: [] });

  try {
    const posts = await searchPosts(term, 6);
    return Response.json(
      { posts },
      // Let the CDN answer repeat searches so they don't reach WordPress.
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error(`Search for "${term}" failed:`, (error as Error).message);
    return Response.json({ posts: [], error: "Search is unavailable right now." }, { status: 502 });
  }
}
