# Render-blocking CSS fix

Baseline: `madaalalam_legacy_js_fix_v2.zip`

Changed `next.config.ts` to enable Next.js App Router CSS inlining:

```ts
experimental: {
  inlineCss: true,
}
```

This moves the compiled CSS from a render-blocking external stylesheet into the initial HTML. The goal is to remove the Lighthouse render-blocking CSS audit for the 17.5 KiB CSS chunk and reduce its impact on FCP/LCP.

No application components, API logic, SEO logic, sitemap logic, image logic, or styling rules were changed.

Note: `inlineCss` is experimental in Next.js, so production Lighthouse and functional checks should be run after deployment.
