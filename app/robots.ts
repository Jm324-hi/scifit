import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kineroz.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/workout", "/recovery", "/plan", "/progress", "/history", "/settings", "/onboarding", "/report"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
