import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق مدى العالم للاستفسارات والملاحظات.',
  alternates: { canonical: '/contact' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
