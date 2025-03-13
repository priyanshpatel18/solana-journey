import type { MetadataRoute } from "next";

const { appName, description } = {
  appName: "TxnShare",
  description:
    "TxnShare allows you to enter a Solana transaction ID and instantly generate a shareable link with a clean, user-friendly preview of the transaction details. Simplify transaction sharing and verification with ease.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}