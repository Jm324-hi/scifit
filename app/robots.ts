import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scifit.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/workout", "/recovery", "/plan", "/progress", "/history", "/settings", "/onboarding"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
