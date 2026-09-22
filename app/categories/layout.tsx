import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'تصنيفات الأخبار',
  description: 'تصفح الأخبار حسب التصنيف في مدى العالم.',
  alternates: { canonical: '/categories' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
