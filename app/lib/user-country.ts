import { headers } from 'next/headers';

// Countries currently configured in Mada Alalam.
// Users outside this list are routed to sources with no country assigned.
const SUPPORTED_COUNTRY_CODES = new Set([
  'JO', 'SY', 'EG', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM',
  'YE', 'IQ', 'LB', 'PS', 'LY', 'TN', 'DZ', 'MA', 'SD',
]);

function normalizeCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase();
  return code && SUPPORTED_COUNTRY_CODES.has(code) ? code : null;
}

function getClientIp(requestHeaders: Headers): string | null {
  const candidates = [
    requestHeaders.get('cf-connecting-ip'),
    requestHeaders.get('x-real-ip'),
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim(),
  ];

  for (const value of candidates) {
    const ip = value?.trim();
    if (!ip) continue;
    // Reject obvious local/private values. Public IPv4/IPv6 addresses are
    // passed to the geolocation service below.
    if (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.2') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.') ||
      ip.startsWith('fc') ||
      ip.startsWith('fd')
    ) {
      continue;
    }
    return ip;
  }

  return null;
}

async function countryFromIp(ip: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    return normalizeCountryCode(data?.country_code);
  } catch {
    return null;
  }
}

export async function getUserCountryCode(): Promise<string> {
  const requestHeaders = await headers();

  // Cloudflare is the preferred source when madaalalam.com is proxied through
  // Cloudflare. These headers are also useful behind other reverse proxies.
  const candidates = [
    requestHeaders.get('cf-ipcountry'),
    requestHeaders.get('x-vercel-ip-country'),
    requestHeaders.get('x-country-code'),
    requestHeaders.get('x-country'),
  ];

  for (const value of candidates) {
    const code = normalizeCountryCode(value);
    if (code) return code;
  }

  // Northflank may not receive Cloudflare's country header in every deployment
  // configuration. Fall back to geolocating the real client IP forwarded by
  // the proxy. This prevents every user from being incorrectly routed to the
  // no-country/global sources when the country header is missing.
  const clientIp = getClientIp(requestHeaders);
  if (clientIp) {
    const code = await countryFromIp(clientIp);
    if (code) return code;
  }

  // No reliable country information: show the independent/global sources.
  return 'NONE';
}
