import { describe, expect, it } from "vitest";
import { checkUpload, MAX_UPLOAD_BYTES, sniffType } from "../lib/admin/files";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

describe("sniffType", () => {
  it("recognises real image and PDF signatures", () => {
    expect(sniffType(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe("image/png");
    expect(sniffType(bytes([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
    expect(sniffType(bytes("RIFF", [0, 0, 0, 0], "WEBP"))?.mime).toBe("image/webp");
    expect(sniffType(bytes("GIF89a"))?.mime).toBe("image/gif");
    expect(sniffType(bytes([0, 0, 0, 0x1c], "ftypavif"))?.mime).toBe("image/avif");
    expect(sniffType(bytes("%PDF-1.7"))?.mime).toBe("application/pdf");
  });

  it("rejects anything else, including SVG and HTML", () => {
    expect(sniffType(bytes("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
    expect(sniffType(bytes("<!doctype html>"))).toBeNull();
    expect(sniffType(bytes("fake"))).toBeNull();
    expect(sniffType(new Uint8Array())).toBeNull();
  });
});

describe("checkUpload", () => {
  const png = { mime: "image/png", ext: "png" };
  const pdf = { mime: "application/pdf", ext: "pdf" };

  it("accepts the right type within the size limit", () => {
    expect(checkUpload("image", 1000, png)).toBeNull();
    expect(checkUpload("cv", 1000, pdf)).toBeNull();
  });

  it("rejects wrong types, empty and oversized files", () => {
    expect(checkUpload("cv", 1000, png)).toMatch(/PDF/);
    expect(checkUpload("image", 1000, pdf)).toMatch(/image/);
    expect(checkUpload("image", 0, png)).toMatch(/vide/);
    expect(checkUpload("image", MAX_UPLOAD_BYTES.image + 1, png)).toMatch(/lourd/);
  });
});
