import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Silly Empire",
    short_name: "The Silly Empire",
    id: "the_silly_empire",
    description: "",
    display: "browser",
    display_override: ["window-controls-overlay"],
    start_url: "/home",
    scope: "/",
    background_color: "black",
    theme_color: "black",
    icons: [
      {
        src: "/manifest-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
