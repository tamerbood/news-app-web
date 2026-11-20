import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'عن مدى العالم',
  description: 'تعرف على هيئة تحرير مدى العالم وكيف نعدّ المواد الصحفية الأصلية ونتعامل مع المصادر.',
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/about',
    title: 'عن مدى العالم',
    description: 'تعرف على هيئة تحرير مدى العالم وكيف نعدّ المواد الصحفية الأصلية ونتعامل مع المصادر.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عن مدى العالم',
    description: 'تعرف على هيئة تحرير مدى العالم وكيف نعدّ المواد الصحفية الأصلية ونتعامل مع المصادر.',
    images: ['/icons/icon-512.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
