'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import ThemeToggle from './ThemeToggle';

const siteSections = [
  ['العالم', 'العالم'],
  ['الرياضة', 'الرياضة'],
  ['تكنولوجيا', 'تكنولوجيا'],
  ['اقتصاد', 'اقتصاد'],
  ['سيارات', 'سيارات'],
  ['منوعات', 'منوعات'],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return;
    try {
      const user = JSON.parse(raw);
      setLoggedIn(true);
      setEmail(user.email ?? '');
    } catch {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const selector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => mobileNavRef.current?.querySelector<HTMLElement>(selector)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !mobileNavRef.current) return;
      const focusable = Array.from(mobileNavRef.current.querySelectorAll<HTMLElement>(selector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(focusFirst);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
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
    if (Math.abs(touchCurrentX.current - touchStartX.current) >= 70) setMobileOpen(false);
    touchStartX.current = null;
    touchCurrentX.current = null;
  }

  function logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    setEmail('');
    window.location.href = '/';
  }

  const activeCategory = (value: string) =>
    pathname === '/categories' &&
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('category') === value;
  const active = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header className="mada-header">
        <div className="mada-container mada-header-inner">
          <Link href="/" className="mada-brand" aria-label="مدى العالم - الصفحة الرئيسية">
            <span className="mada-brand-mark">
              <img src="/icons/icon-512.png" alt="مدى العالم" width="42" height="42" />
            </span>
            <span className="mada-brand-copy"><strong>مدى العالم</strong><span>MADA ALALAM</span></span>
          </Link>

          <nav className="mada-nav" aria-label="التنقل الرئيسي">
            <Link className={`mada-nav-link ${active('/') ? 'active' : ''}`} href="/">الرئيسية</Link>
            {siteSections.map(([label, value]) => (
              <Link key={value} className={`mada-nav-link ${activeCategory(value) ? 'active' : ''}`} href={`/categories?category=${encodeURIComponent(value)}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="mada-header-actions">
            <Link href="/categories" className="mada-icon-btn mada-search-btn" aria-label="البحث وتصفح الأخبار" title="البحث وتصفح الأخبار">⌕</Link>
            <ThemeToggle />
            {loggedIn ? (
              <div className="mada-account-actions">
                <Link className="mada-btn mada-btn-soft mada-account-btn" href="/account">{email ? 'حسابي' : 'الحساب'}</Link>
                <button className="mada-btn mada-btn-danger mada-logout-btn" onClick={logout}>خروج</button>
              </div>
            ) : (
              <Link className="mada-btn mada-btn-primary mada-login-btn" href="/login">تسجيل الدخول</Link>
            )}
            <button
              className="mada-btn mada-btn-ghost mada-menu mada-btn-icon"
              ref={menuTriggerRef}
              aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileOpen}
              aria-controls="mada-mobile-nav"
              onClick={() => setMobileOpen((value) => !value)}
            >{mobileOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>

      {mobileOpen && <button type="button" className="mada-mobile-backdrop" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}
      {mobileOpen && (
        <div
          id="mada-mobile-nav"
          ref={mobileNavRef}
          className="mada-mobile-nav is-open"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mada-mobile-nav-inner">
            <div className="mada-mobile-nav-header">
              <div><span className="mada-kicker">MADA ALALAM</span><strong>القائمة</strong></div>
              <button type="button" className="mada-mobile-close" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <div className="mada-mobile-nav-grid">
              <Link className={active('/') ? 'active' : ''} href="/">الرئيسية</Link>
              {siteSections.map(([label, value]) => (
                <Link className={activeCategory(value) ? 'active' : ''} key={value} href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>
              ))}
              <Link className={active('/favorites') ? 'active' : ''} href={loggedIn ? '/favorites' : '/login'}>المفضلة</Link>
              <Link className={active('/account') ? 'active' : ''} href={loggedIn ? '/account' : '/login'}>{loggedIn ? 'الحساب' : 'تسجيل الدخول'}</Link>
            </div>
            <div className="mada-mobile-swipe-hint">اسحب القائمة لإغلاقها</div>
          </div>
        </div>
      )}
    </>
  );
}
