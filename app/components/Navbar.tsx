'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const categories = [
  ['العالم', 'World'], ['الرياضة', 'Sports'], ['تكنولوجيا', 'Technology'],
  ['اقتصاد', 'Business'], ['سيارات', 'Cars'], ['منوعات', 'Entertainment'],
];

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return;
    try { const user = JSON.parse(raw); setLoggedIn(true); setEmail(user.email ?? ''); }
    catch { localStorage.removeItem('user_token'); localStorage.removeItem('user'); }
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    setLoggedIn(false); setEmail('');
    window.location.href = '/';
  }

  const active = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header className="mada-header">
        <div className="mada-container mada-header-inner">
          <Link href="/" className="mada-brand" aria-label="مدى العالم">
            <span className="mada-brand-mark" aria-hidden="true">م</span>
            <span className="mada-brand-copy"><strong>مدى العالم</strong><span>MADA ALALAM</span></span>
          </Link>

          <nav className="mada-nav" aria-label="التنقل الرئيسي">
            <Link className={`mada-nav-link ${active('/') ? 'active' : ''}`} href="/">الرئيسية</Link>
            <Link className={`mada-nav-link ${active('/sports') ? 'active' : ''}`} href="/sports">الرياضة</Link>
            {loggedIn && <Link className={`mada-nav-link ${active('/favorites') ? 'active' : ''}`} href="/favorites">المفضلة</Link>}
            <div className="mada-dropdown">
              <button className="mada-nav-link" type="button" aria-haspopup="menu">الأقسام <span aria-hidden="true">⌄</span></button>
              <div className="mada-dropdown-panel" role="menu">
                {categories.map(([label, value]) => <Link key={value} href={`/categories?category=${encodeURIComponent(value)}`} role="menuitem">{label}</Link>)}
              </div>
            </div>
          </nav>

          <div className="mada-header-actions">
            <ThemeToggle />
            {loggedIn ? (
              <>
                <Link className="mada-btn mada-btn-soft" href="/account">الحساب</Link>
                <button className="mada-btn mada-btn-danger" onClick={logout}>خروج</button>
              </>
            ) : (
              <Link className="mada-btn mada-btn-primary" href="/login">تسجيل الدخول</Link>
            )}
            <button className="mada-btn mada-btn-ghost mada-menu mada-btn-icon" aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>

      {mobileOpen && <div className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-[2px] lg:hidden" aria-hidden="true" onClick={() => setMobileOpen(false)} />}
      <div id="mada-mobile-nav" className={`mada-mobile-nav lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="mada-container mada-mobile-nav-grid">
          <Link className={active('/') ? 'active' : ''} href="/">الرئيسية</Link>
          <Link className={active('/sports') ? 'active' : ''} href="/sports">الرياضة</Link>
          <Link className={active('/favorites') ? 'active' : ''} href={loggedIn ? '/favorites' : '/login'}>المفضلة</Link>
          <Link className={active('/account') ? 'active' : ''} href={loggedIn ? '/account' : '/login'}>{loggedIn ? 'الحساب' : 'دخول'}</Link>
          {categories.map(([label, value]) => <Link key={value} href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>)}
          <button type="button" onClick={() => setMobileOpen(false)} className="mada-nav-link col-span-2">إغلاق القائمة</button>
        </div>
      </div>
    </>
  );
}
