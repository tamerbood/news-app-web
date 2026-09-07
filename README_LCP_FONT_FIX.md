# MADA ALALAM — LCP/font optimization

Built from madaalalam_render_blocking_css_fix.zip.

Changes:
- IBM Plex Sans Arabic reduced from 4 requested weights to 400 and 700.
- Font display changed from swap to optional to avoid making the LCP text wait on a late font swap.
- Geist Mono removed because it was not used directly by the application.
- Tailwind mono token now uses a system monospace fallback.
- No API, SEO, sitemap, image URL, or article logic changed.

The next PageSpeed run should be used to validate LCP and font transfer before further changes.
