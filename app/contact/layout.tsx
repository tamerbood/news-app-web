import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق مدى العالم للاستفسارات والملاحظات.',
  alternates: { canonical: '/contact' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/contact',
    title: 'تواصل معنا',
    description: 'تواصل مع فريق مدى العالم للاستفسارات والملاحظات.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تواصل معنا',
    description: 'تواصل مع فريق مدى العالم للاستفسارات والملاحظات.',
    images: ['/icons/icon-512.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
