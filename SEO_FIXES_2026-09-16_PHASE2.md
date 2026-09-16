# Mada Alalam SEO Phase 2 fixes

- Restored Next.js native `app/sitemap.ts` so `/sitemap.xml` is generated without a route/metadata conflict.
- Removed the conflicting `app/sitemap.xml/route.ts` and custom sitemap shard route.
- Sitemap now includes all available article pages up to the XML protocol limit of 50,000 URLs and uses `updatedAt`/`publishedAt` for `lastModified`.
- Added `app/admin/layout.tsx` with `noindex, nofollow` metadata.
- Added `noindex` metadata layouts for `/account` and `/favorites`; removed those paths from robots.txt so Google can see the noindex directive.
- Kept `/admin/` and `/api/` disallowed in robots.txt.
- Arabicized the public About and Contact page headings/content to align page language with metadata.
- Kept `/news-sitemap.xml` as the canonical news sitemap endpoint; `/news-sitemap` redirects to it.
- Public `/sources` remains a server-rendered directory page rather than an admin interface.
