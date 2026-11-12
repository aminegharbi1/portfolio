import { db } from "@/lib/db";

// Always resolve the latest CV uploaded from the admin.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const profile = await db.profile.findUnique({ where: { id: 1 }, select: { cvUrl: true } });
  if (!profile?.cvUrl) {
    return new Response("No CV has been uploaded yet.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  // Local uploads are stored as "/uploads/…": redirects need an absolute URL.
  return Response.redirect(new URL(profile.cvUrl, request.url), 307);
}
