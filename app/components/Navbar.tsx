'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import ThemeToggle from './ThemeToggle';

const categories = [
  ['العالم', 'العالم'], ['الرياضة', 'الرياضة'], ['تكنولوجيا', 'تكنولوجيا'],
  ['اقتصاد', 'اقتصاد'], ['سيارات', 'سيارات'], ['منوعات', 'منوعات'],
];

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return;
    try { const user = JSON.parse(raw); setLoggedIn(true); setEmail(user.email ?? ''); }
    catch { localStorage.removeItem('user_token'); localStorage.removeItem('user'); }
  }, []);

  useEffect(() => { setMobileOpen(false); setCategoriesOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => mobileNavRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileOpen(false); return; }
      if (event.key !== 'Tab' || !mobileNavRef.current) return;
      const focusable = Array.from(mobileNavRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(focusFirst);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      (menuTriggerRef.current ?? previousActive)?.focus?.();
    };
  }, [mobileOpen]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchCurrentX.current = touchStartX.current;
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    touchCurrentX.current = event.touches[0]?.clientX ?? touchCurrentX.current;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchCurrentX.current === null) return;
    const distance = touchCurrentX.current - touchStartX.current;
    if (Math.abs(distance) >= 70) setMobileOpen(false);
    touchStartX.current = null;
    touchCurrentX.current = null;
  }

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
            <div className={`mada-dropdown ${categoriesOpen ? 'is-open' : ''}`}>
              <button className="mada-nav-link" type="button" aria-haspopup="menu" aria-expanded={categoriesOpen} aria-controls="mada-categories-menu" onKeyDown={(event) => { if (event.key === 'Escape') setCategoriesOpen(false); }} onClick={() => setCategoriesOpen(v => !v)}>الأقسام <span aria-hidden="true">⌄</span></button>
              <div id="mada-categories-menu" className="mada-dropdown-panel" role="menu">
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
            <button className="mada-btn mada-btn-ghost mada-menu mada-btn-icon" ref={menuTriggerRef} aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileOpen} aria-controls="mada-mobile-nav" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>

      {mobileOpen && <button type="button" className="mada-mobile-backdrop lg:hidden" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}
      {mobileOpen && <div
        id="mada-mobile-nav"
        ref={mobileNavRef}
        className="mada-mobile-nav lg:hidden is-open"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل على الهاتف"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mada-mobile-nav-inner">
          <div className="mada-mobile-nav-header">
            <span>القائمة</span>
            <button type="button" className="mada-mobile-close" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
          <div className="mada-mobile-nav-grid">
            <Link className={active('/') ? 'active' : ''} href="/">الرئيسية</Link>
            <Link className={active('/sports') ? 'active' : ''} href="/sports">الرياضة</Link>
            <Link className={active('/favorites') ? 'active' : ''} href={loggedIn ? '/favorites' : '/login'}>المفضلة</Link>
            <Link className={active('/account') ? 'active' : ''} href={loggedIn ? '/account' : '/login'}>{loggedIn ? 'الحساب' : 'دخول'}</Link>
            {categories.map(([label, value]) => <Link key={value} href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>)}
          </div>
          <div className="mada-mobile-swipe-hint">اسحب يمينًا أو يسارًا للإغلاق</div>
        </div>
      </div>}
    </>
  );
}
