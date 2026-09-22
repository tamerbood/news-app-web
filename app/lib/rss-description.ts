/**
 * Clean syndicated RSS descriptions before they are rendered or serialized
 * into Next.js payloads. Original/editorial article text should not use this.
 */
export function cleanRssDescription(value?: string | null, maxLength?: number): string {
  if (!value) return '';

  const decoded = value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  const cleaned = decoded
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    // Common WordPress/RSS footer injected by publishers.
    .replace(/The post[\s\S]*?appeared first on[\s\S]*?(?:\.|$)/gi, ' ')
    .replace(/(?:ظهرت|ظهر)\s+(?:المقالة|المقال|التدوينة)[\s\S]*?(?:أولاً|أولًا)\s+على[\s\S]*?(?:\.|$)/gi, ' ')
    .replace(/(?:أكمل القراءة|اقرأ المزيد|قراءة المزيد)\s*[←→»›…]*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!maxLength || cleaned.length <= maxLength) return cleaned;

  const shortened = cleaned.slice(0, maxLength + 1);
  const lastSpace = shortened.lastIndexOf(' ');
  const cutAt = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
  return `${shortened.slice(0, cutAt).trim()}…`;
}
