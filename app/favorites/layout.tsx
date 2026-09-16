import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المفضلة',
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
