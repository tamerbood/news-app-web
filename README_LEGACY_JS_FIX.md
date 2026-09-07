# MADA ALALAM — Legacy JavaScript Fix

Built from the current full web project baseline.

Changes:
- Added a modern Browserslist target matching Next.js 16's modern browser baseline.
- Raised TypeScript target from ES2017 to ES2020 so application code is not unnecessarily downlevelled.
- Removed the only direct `Array.prototype.flatMap()` usage in the admin client and replaced it with `reduce + concat`.
- Preserved SEO, sitemap/news-sitemap, accessibility, performance, API integration, and UI behavior.

Goal:
Reduce unnecessary legacy JavaScript/polyfill output reported by Lighthouse (Array.at, flat, flatMap, Object.fromEntries, Object.hasOwn, trimStart/trimEnd).

Important:
Run a fresh production build and Lighthouse after deployment. The final generated chunk is the source of truth; if a dependency still injects a polyfill, it must be identified from the generated bundle rather than changed blindly.


Additional fix:
- Replaced Next.js's built-in polyfill-module with an empty module through the Turbopack resolveAlias configuration.
- This specifically removes the legacy polyfills Lighthouse identified: Array.at, Array.flat, Array.flatMap, Object.fromEntries, Object.hasOwn, trimStart, and trimEnd.
- The project targets Next.js 16's modern browser baseline (Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+).
