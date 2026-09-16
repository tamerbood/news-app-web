import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const PAGE_SIZE = 100;
const API_PAGES_PER_SITEMAP = 20;

export const revalidate = 3600;

interface SitemapArticle {
  id: string;
  publishedAt?: string;
  updatedAt?: string;
}

interface ArticlesResponse {
  items?: SitemapArticle[];
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

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function validDate(value?: string): string | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page: rawPage } = await params;
  const sitemapPage = Number.parseInt(rawPage, 10);

  if (!Number.isSafeInteger(sitemapPage) || sitemapPage < 1) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const startApiPage = (sitemapPage - 1) * API_PAGES_PER_SITEMAP + 1;
  const endApiPage = startApiPage + API_PAGES_PER_SITEMAP - 1;
  const responses = await Promise.all(
    Array.from({ length: API_PAGES_PER_SITEMAP }, (_, index) =>
      getArticlesPage(startApiPage + index),
    ),
  );

  const seen = new Set<string>();
  const urls: string[] = [];
  const base = siteUrl.replace(/\/$/, '');

  if (sitemapPage === 1) {
    const staticRoutes = [
      base,
      `${base}/categories`,
      `${base}/sports`,
      `${base}/sources`,
      `${base}/about`,
      `${base}/contact`,
      `${base}/privacy`,
      `${base}/terms`,
    ];

    for (const url of staticRoutes) {
      urls.push(`  <url><loc>${xmlEscape(url)}</loc></url>`);
    }
  }

  for (const response of responses) {
    for (const article of response.items ?? []) {
      if (!article?.id || seen.has(article.id)) continue;
      seen.add(article.id);

      const lastModified = validDate(article.updatedAt || article.publishedAt);
      urls.push(
        `  <url><loc>${xmlEscape(`${base}/articles/${encodeURIComponent(article.id)}`)}</loc>${
          lastModified ? `<lastmod>${lastModified}</lastmod>` : ''
        }</url>`,
      );
    }
  }

  if (urls.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
