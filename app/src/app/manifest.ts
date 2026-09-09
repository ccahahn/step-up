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
      // Without a maskable entry Android treats the icon as legacy art: it
      // shrinks it and mounts it on a white circular plate. Declaring maskable
      // lets the launcher crop our own black field to whatever shape it uses.
      // The art already suits both — full-bleed black, lotus well inside the
      // centre 80% safe zone.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
