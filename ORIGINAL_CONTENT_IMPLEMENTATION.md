# خاص مدى العالم — WEB/Admin

- Admin navigation contains `خاص مدى العالم`.
- `/admin/original-content`: choose one of six sections, generate a draft, list drafts/published items, open/delete drafts.
- `/admin/original-content/[id]`: edit title, slug, excerpt, body, category, image URL, SEO title/description; inspect sources and notes; publish manually.
- Published original article pages show `خاص مدى العالم`, render full content, use index/follow and NewsArticle schema.
- RSS article pages keep noindex/follow and source-link behavior.
- Homepage and category pages feature published original content separately from RSS.
- `/original` collects published Mada Alalam content; it is noindex while empty and enters sitemap only when content exists.
- sitemap/news-sitemap fetch only the dedicated published-original API endpoint, so drafts and RSS cannot leak into them.
