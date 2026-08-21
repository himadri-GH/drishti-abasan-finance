import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Drishti Abasan Finance",
    short_name: "Drishti Finance",
    description: "Financial management for Drishti Abasan building complex",
    start_url: "/",
    display: "standalone",
    background_color: "#e9f0ee",
    theme_color: "#18312e",
    orientation: "any",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}