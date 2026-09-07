/**
 * Reduce downloads from image CDNs that expose a size in their URL.
 * The function is intentionally conservative: unknown URLs are returned unchanged.
 */
export function optimizeImageUrl(url: string | undefined, targetWidth: number): string | undefined {
  if (!url) return url;
  const width = Math.max(80, Math.round(targetWidth));

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname;

    // France 24 image CDN: /w:1280/ -> /w:160/ etc.
    if (host === 's.france24.com') {
      pathname = pathname.replace(/\/w:\d+(?=\/)/, `/w:${Math.min(width, 640)}`);
      parsed.pathname = pathname;
      return parsed.toString();
    }

    // VetoGate exposes resized JPEG/WebP assets as /600x338o/...
    if (host === 'www.vetogate.com' || host === 'vetogate.com') {
      const resizedWidth = width <= 160 ? 300 : width <= 480 ? 450 : 600;
      pathname = pathname.replace(/\/\d+x\d+o(?=\/)/, `/${resizedWidth}x${Math.round(resizedWidth * 338 / 600)}o`);
      parsed.pathname = pathname;
      return parsed.toString();
    }

    // imgy.pro uses /WIDTHxHEIGHT/ in the path. Keep the original aspect ratio.
    if (host === 'imgy.pro') {
      const match = pathname.match(/\/(\d+)x(\d+)(?=\/)/);
      if (match) {
        const originalWidth = Number(match[1]);
        const originalHeight = Number(match[2]);
        if (originalWidth > 0 && originalHeight > 0) {
          const resizedWidth = Math.min(width, originalWidth);
          const resizedHeight = Math.max(1, Math.round(resizedWidth * originalHeight / originalWidth));
          pathname = pathname.replace(match[0], `/${resizedWidth}x${resizedHeight}`);
          parsed.pathname = pathname;
          return parsed.toString();
        }
      }
    }
  } catch {
    // Keep the original URL if it is not an absolute/valid URL.
  }

  return url;
}
