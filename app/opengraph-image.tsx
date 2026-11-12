import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/queries";

export const alt = "Mohamed Amine Gharbi, AI & Data Engineering Student";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OpengraphImage() {
  const profile = await getProfile();
  const accent = /^#[0-9a-f]{6}$/i.test(profile.accentColor) ? profile.accentColor : "#4C8DFF";
  const title = profile.heroTitle.split(/(\*[^*]+\*)/g).filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#05070C",
          backgroundImage:
            "linear-gradient(rgba(76,141,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(76,141,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          color: "#F5F7FB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${accent}`,
              borderRadius: 12,
              color: accent,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            AG
          </div>
          <div style={{ fontSize: 30, color: "#A9B3C6" }}>amine.gharbi_</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
          {title.map((part, i) =>
            part.startsWith("*") ? (
              <span key={i} style={{ color: accent }}>
                {part.slice(1, -1)}
              </span>
            ) : (
              <span key={i} style={{ whiteSpace: "pre" }}>
                {part}
              </span>
            ),
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#8692A8" }}>
          <span>
            {profile.name} · {profile.headline}
          </span>
          <span style={{ color: "#3DDC97" }}>● {profile.location}</span>
        </div>
      </div>
    ),
    size,
  );
}
