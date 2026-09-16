import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'عن مدى العالم',
  description: 'تعرف على منصة مدى العالم وكيف تجمع الأخبار من مصادر متعددة.',
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/about',
    title: 'عن مدى العالم',
    description: 'تعرف على منصة مدى العالم وكيف تجمع الأخبار من مصادر متعددة.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عن مدى العالم',
    description: 'تعرف على منصة مدى العالم وكيف تجمع الأخبار من مصادر متعددة.',
    images: ['/icons/icon-512.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
