/** Upload rules. Pure functions, no I/O (unit-tested). */

export type UploadKind = "image" | "cv";

export type DetectedType = { mime: string; ext: string };

/** Vercel functions reject request bodies above 4.5 MB, so stay below it. */
export const MAX_UPLOAD_BYTES: Record<UploadKind, number> = {
  image: 4 * 1024 * 1024,
  cv: 4 * 1024 * 1024,
};

export const ACCEPT: Record<UploadKind, string> = {
  image: "image/png,image/jpeg,image/webp,image/avif,image/gif",
  cv: "application/pdf",
};

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

/**
 * Detects the real file type from its first bytes ("magic numbers").
 * The browser-provided MIME type and file name are never trusted. SVG is not accepted
 * (it can carry scripts).
 */
export function sniffType(bytes: Uint8Array): DetectedType | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG") return { mime: "image/png", ext: "png" };
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { mime: "image/jpeg", ext: "jpg" };
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP")
    return { mime: "image/webp", ext: "webp" };
  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a"))
    return { mime: "image/gif", ext: "gif" };
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12)))
    return { mime: "image/avif", ext: "avif" };
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  return null;
}

/** Returns an error message (in French, shown in the admin) or null when the file is accepted. */
export function checkUpload(kind: UploadKind, size: number, type: DetectedType | null): string | null {
  if (size === 0) return "Le fichier est vide.";
  if (size > MAX_UPLOAD_BYTES[kind]) {
    return `Fichier trop lourd (max ${MAX_UPLOAD_BYTES[kind] / 1024 / 1024} Mo).`;
  }
  if (!type) return kind === "cv" ? "Le CV doit être un PDF." : "Format non accepté (PNG, JPEG, WebP, AVIF ou GIF).";
  if (kind === "cv" && type.mime !== "application/pdf") return "Le CV doit être un PDF.";
  if (kind === "image" && !type.mime.startsWith("image/")) return "Ce fichier n'est pas une image.";
  return null;
}
