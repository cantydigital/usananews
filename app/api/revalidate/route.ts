import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

// Called by WordPress after content is saved so the site picks up changes immediately.
export async function POST(request: NextRequest) {
  const secret = process.env.WORDPRESS_REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  // expire: 0 so the next visitor gets fresh data rather than one more stale render.
  revalidateTag("wordpress", { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
