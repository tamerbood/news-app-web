import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'مصادر الأخبار',
  description: 'تصفح مصادر الأخبار المتاحة عبر مدى العالم.',
  alternates: { canonical: '/sources' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/sources',
    title: 'مصادر الأخبار',
    description: 'تصفح مصادر الأخبار المتاحة عبر مدى العالم.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مصادر الأخبار',
    description: 'تصفح مصادر الأخبار المتاحة عبر مدى العالم.',
    images: ['/icons/icon-512.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
