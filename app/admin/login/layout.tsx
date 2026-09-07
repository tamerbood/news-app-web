import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل دخول الإدارة',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
