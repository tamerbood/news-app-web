import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'أخبار الرياضة اليوم',
  description: 'آخر الأخبار الرياضية والنتائج والمباريات في مدى العالم.',
  alternates: { canonical: '/sports' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
