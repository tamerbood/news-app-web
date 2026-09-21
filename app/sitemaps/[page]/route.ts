import { NextResponse } from 'next/server';

// Legacy paginated sitemaps were able to expose syndicated RSS articles.
// They are permanently retired; the supported sitemap is /sitemap.xml,
// which only includes articles explicitly marked as original.
export const dynamic = 'force-static';

export async function GET() {
  return new NextResponse('Gone', {
    status: 410,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
