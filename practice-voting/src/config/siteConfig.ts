import { Metadata } from "next";

const { title, description, ogImage, baseURL } = {
  title: "",
  description: "",
  baseURL: "http://localhost:3000",
  ogImage: "",
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
  applicationName: "",
  alternates: {
    canonical: baseURL,
  },
  keywords: [],
};