import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export const revalidate = 3600;

export function GET() {
  return NextResponse.redirect(`${siteUrl.replace(/\/$/, '')}/news-sitemap.xml`, 308);
}
