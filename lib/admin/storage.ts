import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import type { DetectedType, UploadKind } from "@/lib/admin/files";

/**
 * Stores uploads on Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production),
 * otherwise in public/uploads (local development only: Vercel's filesystem is read-only).
 */
const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");
const LOCAL_PREFIX = "/uploads/";
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

export async function storeFile(kind: UploadKind, bytes: Uint8Array, type: DetectedType): Promise<string> {
  const name = `${kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${type.ext}`;

  if (blobEnabled()) {
    const blob = await put(`${kind === "cv" ? "cv" : "images"}/${name}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: type.mime,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing: connect a Vercel Blob store to the project.");
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), bytes);
  return `${LOCAL_PREFIX}${name}`;
}

/** Best-effort removal of a file this app uploaded. Other URLs (e.g. /profile.png) are left alone. */
export async function removeFile(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith(LOCAL_PREFIX)) {
      // basename() blocks "../" tricks.
      await unlink(path.join(LOCAL_DIR, path.basename(url)));
    } else if (blobEnabled() && BLOB_HOST.test(new URL(url).hostname)) {
      await del(url);
    }
  } catch (err) {
    console.warn("[storage] could not remove", url, err);
  }
}

/** Removes every URL in `before` that is no longer in `after`. */
export async function removeReplaced(before: (string | null | undefined)[], after: (string | null | undefined)[]) {
  const keep = new Set(after.filter(Boolean));
  await Promise.all(before.filter((u) => u && !keep.has(u)).map((u) => removeFile(u)));
}
