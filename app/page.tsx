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
  return <HomeClient />;
}
