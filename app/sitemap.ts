import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const PAGE_SIZE = 100;
const MAX_URLS = 50_000;
const CONCURRENCY = 10;

interface SitemapArticle {
  id: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  isOriginal?: boolean;
}

interface ArticlesResponse {
  items?: SitemapArticle[];
  totalPages?: number;
}

async function getArticlesPage(page: number): Promise<ArticlesResponse> {
  if (!apiUrl) return {};

  try {
    const response = await fetch(`${apiUrl}/articles?page=${page}&limit=${PAGE_SIZE}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return {};
    const data = await response.json();
    return data && typeof data === 'object' ? (data as ArticlesResponse) : {};
  } catch {
    return {};
  }
}

function validDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1, changeFrequency: 'hourly' },
    { url: `${base}/categories`, priority: 0.8, changeFrequency: 'hourly' },
    { url: `${base}/sports`, priority: 0.7, changeFrequency: 'hourly' },
    { url: `${base}/sources`, priority: 0.6, changeFrequency: 'daily' },
    { url: `${base}/about`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${base}/contact`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${base}/privacy`, priority: 0.2, changeFrequency: 'yearly' },
    { url: `${base}/terms`, priority: 0.2, changeFrequency: 'yearly' },
  ];

  if (!apiUrl) return staticRoutes;

  const firstPage = await getArticlesPage(1);
  const totalPages = Math.max(Number(firstPage.totalPages) || 1, 1);
  const maxArticlePages = Math.ceil(Math.max(MAX_URLS - staticRoutes.length, 0) / PAGE_SIZE);
  const pagesToFetch = Math.min(totalPages, maxArticlePages);

  const responses: ArticlesResponse[] = [];
  if (pagesToFetch >= 1) responses.push(firstPage);

  for (let start = 2; start <= pagesToFetch; start += CONCURRENCY) {
    const end = Math.min(start + CONCURRENCY - 1, pagesToFetch);
    const batch = await Promise.all(
      Array.from({ length: end - start + 1 }, (_, index) => getArticlesPage(start + index)),
    );
    responses.push(...batch);
  }

  const seen = new Set<string>();
  const articles: MetadataRoute.Sitemap = [];

  for (const response of responses) {
    for (const article of response.items ?? []) {
      if (!article?.id || article.isOriginal !== true || seen.has(article.id)) continue;
      if (articles.length + staticRoutes.length >= MAX_URLS) break;
      seen.add(article.id);

      const lastModified = validDate(article.updatedAt || article.publishedAt);
      articles.push({
        url: `${base}/articles/${encodeURIComponent(article.id)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
    if (articles.length + staticRoutes.length >= MAX_URLS) break;
  }

  return [...staticRoutes, ...articles];
}
