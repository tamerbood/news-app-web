import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const PAGE_SIZE = 100;
const API_PAGES_PER_SITEMAP = 20;

export const revalidate = 3600;

interface ArticlesResponse {
  totalPages?: number;
}

async function getFirstPage(): Promise<ArticlesResponse> {
  if (!apiUrl) return {};

  try {
    const response = await fetch(`${apiUrl}/articles?page=1&limit=${PAGE_SIZE}`, {
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

export async function GET() {
  const base = siteUrl.replace(/\/$/, '');
  const firstPage = await getFirstPage();
  const totalPages = Math.max(Number(firstPage.totalPages) || 1, 1);
  const sitemapCount = Math.ceil(totalPages / API_PAGES_PER_SITEMAP);

  const entries = Array.from({ length: sitemapCount }, (_, index) => {
    const sitemapPage = index + 1;
    return `  <sitemap><loc>${xmlEscape(`${base}/sitemaps/${sitemapPage}.xml`)}</loc></sitemap>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
