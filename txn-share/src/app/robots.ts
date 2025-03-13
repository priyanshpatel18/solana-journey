import type { MetadataRoute } from "next";

const baseUrl = "https://txnshare.priyanshpatel.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: baseUrl,
  };
}