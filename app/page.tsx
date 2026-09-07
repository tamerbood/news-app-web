import type { Metadata } from 'next';
import HomeClient from './HomeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export const metadata: Metadata = {
  title: 'أخبار العالم لحظة بلحظة',
  description: 'أحدث أخبار العالم والعرب والرياضة والتكنولوجيا والاقتصاد من مصادر متعددة في تجربة عربية حديثة وسريعة.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'مدى العالم | أخبار العالم لحظة بلحظة',
    description: 'أحدث الأخبار من مصادر متعددة في تجربة عربية حديثة وسريعة.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
  },
  twitter: {
    card: 'summary',
    title: 'مدى العالم | أخبار العالم لحظة بلحظة',
    description: 'أحدث الأخبار من مصادر متعددة في تجربة عربية حديثة وسريعة.',
  },
};

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${normalizedSiteUrl}/#organization`,
        name: 'مدى العالم',
        alternateName: ['MADA ALALAM', 'madaalalam.com'],
        url: normalizedSiteUrl,
        logo: `${normalizedSiteUrl}/favicon.ico`,
        description: 'مدى العالم منصة أخبار عربية تجمع أحدث الأخبار من مصادر متعددة في مكان واحد.',
        email: 'contact@madaalalam.com',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@madaalalam.com',
          contactType: 'customer support',
          availableLanguage: ['ar', 'en'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${normalizedSiteUrl}/#website`,
        name: 'مدى العالم',
        alternateName: ['MADA ALALAM', 'madaalalam.com'],
        url: `${normalizedSiteUrl}/`,
        inLanguage: 'ar',
        publisher: { '@id': `${normalizedSiteUrl}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${normalizedSiteUrl}/#webpage`,
        url: `${normalizedSiteUrl}/`,
        name: 'مدى العالم | أخبار العالم لحظة بلحظة',
        description: 'أحدث أخبار العالم والعرب والرياضة والتكنولوجيا والاقتصاد من مصادر متعددة في تجربة عربية حديثة وسريعة.',
        isPartOf: { '@id': `${normalizedSiteUrl}/#website` },
        about: { '@id': `${normalizedSiteUrl}/#organization` },
        inLanguage: 'ar',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <HomeClient />
    </>
  );
}
