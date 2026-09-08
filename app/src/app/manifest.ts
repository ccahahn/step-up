import type { MetadataRoute } from "next";

// Android/Chrome install. iOS ignores this and reads the apple-* metadata in
// layout.tsx instead, so the two have to agree.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Step Up",
    short_name: "Step Up",
    description: "Plan what's coming up, then keep the difference.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0C0E",
    theme_color: "#0B0C0E",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
