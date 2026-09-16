import { headers } from 'next/headers';

// Countries currently configured in Mada Alalam.
// Users outside this list are routed to sources with no country assigned.
const SUPPORTED_COUNTRY_CODES = new Set([
  'JO', 'SY', 'EG', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM',
  'YE', 'IQ', 'LB', 'PS', 'LY', 'TN', 'DZ', 'MA', 'SD',
]);

export async function getUserCountryCode(): Promise<string> {
  const requestHeaders = await headers();

  // Cloudflare is the primary source for madaalalam.com. The other headers
  // make the helper work behind common reverse proxies as well.
  const candidates = [
    requestHeaders.get('cf-ipcountry'),
    requestHeaders.get('x-vercel-ip-country'),
    requestHeaders.get('x-country-code'),
    requestHeaders.get('x-country'),
  ];

  for (const value of candidates) {
    const code = value?.trim().toUpperCase();
    if (code && SUPPORTED_COUNTRY_CODES.has(code)) {
      return code;
    }
  }

  // No country header, or a country outside the configured list:
  // show the independent/global sources (countryId = null).
  return 'NONE';
}
