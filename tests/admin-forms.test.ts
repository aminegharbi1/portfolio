import { describe, expect, it } from "vitest";
import { assetUrl, lines, many, month, optionalUrl, slugify, toMonthInput } from "../lib/admin/forms";

describe("slugify", () => {
  it("makes URL-safe slugs, accents included", () => {
    expect(slugify("FraudGuard Bank")).toBe("fraudguard-bank");
    expect(slugify("  Réclamations & Suivi ! ")).toBe("reclamations-suivi");
  });
});

describe("links", () => {
  it("accepts http(s) links and empty values only", () => {
    expect(optionalUrl.parse("https://github.com/x")).toBe("https://github.com/x");
    expect(optionalUrl.parse("")).toBeNull();
    expect(optionalUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(optionalUrl.safeParse("github.com/x").success).toBe(false);
  });

  it("accepts uploaded files: site paths or https", () => {
    expect(assetUrl.parse("/uploads/a.png")).toBe("/uploads/a.png");
    expect(assetUrl.parse("https://x.public.blob.vercel-storage.com/a.png")).toContain("https://");
    expect(assetUrl.safeParse("//evil.com/a.png").success).toBe(false);
    expect(assetUrl.safeParse("javascript:alert(1)").success).toBe(false);
  });
});

describe("dates", () => {
  it("round-trips <input type=month> values", () => {
    const d = month("Date").parse("2026-06");
    expect(d.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(toMonthInput(d)).toBe("2026-06");
    expect(month("Date").safeParse("").success).toBe(false);
  });
});

describe("FormData helpers", () => {
  it("reads lists", () => {
    const fd = new FormData();
    fd.append("stack", "React");
    fd.append("stack", " ");
    fd.append("stack", "Django");
    fd.set("features", "One\r\n\n  Two  \n");
    expect(many(fd, "stack")).toEqual(["React", "Django"]);
    expect(lines(fd, "features")).toEqual(["One", "Two"]);
  });
});
