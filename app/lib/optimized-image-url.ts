/**
 * Keeps source image URLs unchanged.
 *
 * Some providers expose size-looking path segments that are not guaranteed
 * to support arbitrary resizing. Keeping the original URL avoids broken
 * images while preserving the existing image markup and loading strategy.
 */
export function optimizeImageUrl(url: string | undefined, _targetWidth: number): string | undefined {
  return url;
}
