import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'مصادر الأخبار',
  description: 'تصفح مصادر الأخبار المتاحة عبر مدى العالم.',
  alternates: { canonical: '/sources' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
