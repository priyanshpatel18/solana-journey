import { Metadata } from "next";

const { title, description, ogImage, baseURL } = {
  title: "TxnShare",
  description:
    "TxnShare allows you to enter a Solana transaction ID and instantly generate a shareable link with a clean, user-friendly preview of the transaction details. Simplify transaction sharing and verification with ease.",
  baseURL: "https://txnshare.priyanshpatel.site",
  ogImage: "https://txnshare.priyanshpatel.site/open-graph.png",
};

export const siteConfig: Metadata = {
  title,
  description,
  metadataBase: new URL(baseURL),
  openGraph: {
    title,
    description,
    images: [ogImage],
    url: baseURL,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "TxnShare",
  alternates: {
    canonical: baseURL,
  },
  keywords: ["Solana", "transaction", "share", "crypto", "blockchain"],
};
