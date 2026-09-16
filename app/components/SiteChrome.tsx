'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Navbar from './Navbar';

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdmin) return <>{children}</>;

  return (
    <div className="mada-shell">
      <a className="mada-skip-link" href="#main-content">تخطى إلى المحتوى الرئيسي</a>
      <Navbar />
      <div className="flex-1" id="main-content">{children}</div>
      <footer className="mada-footer">
        <div className="mada-container mada-footer-inner">
          <div className="mada-footer-brand-block">
            <Link href="/" className="mada-footer-brand-link" aria-label="مدى العالم">
              <span className="mada-brand-mark mada-brand-mark-footer" aria-hidden="true">م</span>
              <span><strong>مدى العالم</strong><small>MADA ALALAM</small></span>
            </Link>
            <p>نبض الأخبار من مصادر متعددة، في مكان واحد.</p>
          </div>
          <nav className="mada-footer-links" aria-label="روابط الموقع">
            <Link href="/about">عن مدى العالم</Link>
            <Link href="/contact">تواصل معنا</Link>
            <Link href="/privacy">الخصوصية</Link>
            <Link href="/terms">الشروط والأحكام</Link>
          </nav>
        </div>
        <div className="mada-footer-bottom">© {new Date().getFullYear()} مدى العالم · جميع الحقوق محفوظة.</div>
      </footer>
    </div>
  );
}
