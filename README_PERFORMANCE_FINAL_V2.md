# MADA ALALAM — Performance Final V2

Based only on `madaalalam_lcp_font_optimization_v1_imagefix.zip`.

## Changes
- Reduced the homepage client JavaScript boundary: the homepage feed and article cards are now server-rendered.
- Kept only small client components for favorites state/actions and the 60-second refresh.
- Pagination is server-rendered through URL links (`/?page=N`) instead of a full client feed state.
- Preserved the existing Top Stories, Stories, category distribution, API contract, article URLs, SEO, sitemap, and image URLs.
- Reverted the font display mode to `swap` after the previous `optional` change increased the measured LCP. The reduced 400/700 font weights remain.
- Simplified the hero paint path by removing the hero text shadow and blur filters while preserving the visual gradients.
- Improved the informational badge contrast for the remaining Accessibility audit.

## Validation
- TypeScript/JSX syntax transpilation passed for all changed files.
- Full Next.js production build could not be executed in the working container because `next` was not installed after the dependency installation attempt timed out.
- A real Northflank build and a fresh PageSpeed Insights run are required before declaring the performance result final.
