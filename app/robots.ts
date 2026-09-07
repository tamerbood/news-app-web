import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/favorites/',
        '/login/',
        '/register/',
        '/api/',
      ],
    },
    sitemap: [
      `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
      `${siteUrl.replace(/\/$/, '')}/news-sitemap.xml`,
    ],
  };
}
