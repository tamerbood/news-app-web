import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;

interface SitemapArticle {
  id: string;
  publishedAt?: string;
  createdAt?: string;
}

interface ArticlesResponse {
  items?: SitemapArticle[];
  totalPages?: number;
}

async function getArticlesPage(page: number): Promise<ArticlesResponse> {
  if (!apiUrl) return {};

  try {
    const response = await fetch(
      `${apiUrl}/articles?page=${page}&limit=${PAGE_SIZE}`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) return {};
    const data = await response.json();
    return data && typeof data === 'object' ? (data as ArticlesResponse) : {};
  } catch {
    return {};
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/categories`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sports`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/sources`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  if (!apiUrl) return staticRoutes;

  const firstPage = await getArticlesPage(1);
  const totalPages = Math.min(Math.max(firstPage.totalPages ?? 1, 1), 100);
  const pages = [firstPage];

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push(await getArticlesPage(page));
  }

  const seen = new Set<string>();
  const articleRoutes: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const article of page.items ?? []) {
      if (!article?.id || seen.has(article.id)) continue;
      seen.add(article.id);
      articleRoutes.push({
        url: `${base}/articles/${encodeURIComponent(article.id)}`,
        lastModified: article.createdAt || article.publishedAt,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  return [...staticRoutes, ...articleRoutes];
}
