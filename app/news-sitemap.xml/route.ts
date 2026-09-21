import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export const revalidate = 1800;

interface NewsArticle {
  id: string;
  title: string;
  publishedAt?: string;
  isOriginal?: boolean;
}

interface ArticlesResponse {
  items?: NewsArticle[];
  totalPages?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getArticlesPage(page: number): Promise<ArticlesResponse> {
  if (!apiUrl) return {};

  try {
    const response = await fetch(
      `${apiUrl}/articles?page=${page}&limit=${PAGE_SIZE}`,
      { next: { revalidate } },
    );

    if (!response.ok) return {};
    const data = await response.json();
    return data && typeof data === 'object' ? (data as ArticlesResponse) : {};
  } catch {
    return {};
  }
}

export async function GET() {
  const base = siteUrl.replace(/\/$/, '');
  const cutoff = Date.now() - MAX_AGE_MS;
  const articles: NewsArticle[] = [];
  const seen = new Set<string>();

  if (apiUrl) {
    const firstPage = await getArticlesPage(1);
    const totalPages = Math.min(Math.max(firstPage.totalPages ?? 1, 1), MAX_PAGES);
    const pages = [firstPage];

    for (let page = 2; page <= totalPages; page += 1) {
      pages.push(await getArticlesPage(page));
    }

    for (const page of pages) {
      for (const article of page.items ?? []) {
        if (!article?.id || !article.title || article.isOriginal !== true || seen.has(article.id)) continue;
        const published = article.publishedAt;
        if (!published) continue;
        const timestamp = Date.parse(published);
        if (!Number.isFinite(timestamp) || timestamp < cutoff) continue;

        seen.add(article.id);
        articles.push(article);
        if (articles.length >= 1000) break;
      }
      if (articles.length >= 1000) break;
    }
  }

  const urls = articles.map((article) => {
    const published = article.publishedAt!;
    return `    <url>\n      <loc>${escapeXml(`${base}/articles/${encodeURIComponent(article.id)}`)}</loc>\n      <news:news>\n        <news:publication>\n          <news:name>مدى العالم</news:name>\n          <news:language>ar</news:language>\n        </news:publication>\n        <news:publication_date>${escapeXml(new Date(published).toISOString())}</news:publication_date>\n        <news:title>${escapeXml(article.title.trim())}</news:title>\n      </news:news>\n    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls.join('\n')}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
