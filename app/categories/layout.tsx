import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'تصنيفات التقارير',
  description: 'تصفح التقارير والمواد التحريرية الأصلية في مدى العالم.',
  alternates: { canonical: '/categories' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
