import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'أخبار الرياضة اليوم',
  description: 'آخر الأخبار الرياضية والنتائج والمباريات في مدى العالم.',
  alternates: { canonical: '/sports' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/sports',
    title: 'أخبار الرياضة اليوم',
    description: 'آخر الأخبار الرياضية والنتائج والمباريات في مدى العالم.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أخبار الرياضة اليوم',
    description: 'آخر الأخبار الرياضية والنتائج والمباريات في مدى العالم.',
    images: ['/icons/icon-512.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
