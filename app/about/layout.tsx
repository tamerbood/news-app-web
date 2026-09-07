import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'عن مدى العالم',
  description: 'تعرف على منصة مدى العالم وكيف تجمع الأخبار من مصادر متعددة.',
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
