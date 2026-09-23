'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import Navbar from './Navbar';

const footerCategories = [
  ['سياسة', 'politics'], ['اقتصاد', 'economy'], ['رياضة', 'sports'], ['تكنولوجيا', 'technology'],
] as const;

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
        <div className="mada-container mada-footer-grid">
          <div className="mada-footer-about">
            <Link href="/" className="mada-brand mada-footer-logo"><Image className="mada-brand-logo" src="/icons/icon-512.png" alt="" width={48} height={48} priority /><span className="mada-brand-copy"><strong>مدى العالم</strong><span>MADA ALALAM</span></span></Link>
            <p>صحيفة رقمية عربية تجمع أهم الأخبار من مصادر متعددة، وتقدمها بوضوح وسرعة في مكان واحد.</p>
          </div>
          <div className="mada-footer-column"><h3>مدى العالم</h3><Link href="/about">من نحن</Link><Link href="/contact">تواصل معنا</Link><Link href="/sources">المصادر</Link><Link href="/original">إنتاج مدى العالم</Link></div>
          <div className="mada-footer-column"><h3>الأقسام</h3>{footerCategories.map(([label, key]) => <Link key={key} href={`/categories?category=${encodeURIComponent(key)}`}>{label}</Link>)}</div>
          <div className="mada-footer-newsletter"><h3>ابقَ في قلب الخبر</h3><p>تابع أهم الأخبار والتغطيات عبر مدى العالم.</p><div className="mada-footer-app-row"><Link href="/favorites">المفضلة</Link><Link href="/account">حسابي</Link></div><span className="mada-footer-coming">تطبيق مدى العالم • قريبًا</span></div>
        </div>
        <div className="mada-footer-legal"><div className="mada-container"><span>© 2026 مدى العالم. جميع الحقوق محفوظة.</span><nav><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link></nav></div></div>
      </footer>
    </div>
  );
}
