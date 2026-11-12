import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Caching uses the ISR model (segment `revalidate` + `revalidatePath` on admin saves),
  // so `cacheComponents` is intentionally left off.
  images: {
    // Uploaded covers, gallery images and the profile photo live on Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],  },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
