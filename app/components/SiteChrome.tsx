'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Navbar from './Navbar';

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="font-semibold text-gray-900">
              Mada Alalam
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              Latest news from trusted sources.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-gray-600 transition hover:text-black">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 transition hover:text-black">Terms of Service</Link>
            <Link href="/about" className="text-gray-600 transition hover:text-black">About</Link>
            <Link href="/contact" className="text-gray-600 transition hover:text-black">Contact</Link>
          </nav>
        </div>

        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Mada Alalam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
