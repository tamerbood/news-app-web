'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import ThemeToggle from './ThemeToggle';
import { PUBLIC_CATEGORIES } from '../lib/public-categories';

const categories = PUBLIC_CATEGORIES.map(({ label, key }) => [label, key] as const);
const headerCategories = categories.filter(([, key]) => key !== 'الرياضة').slice(0, 6);

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.15A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z" /></svg>;
}
function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>;
}

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; source?: { name?: string } }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [breakingArticles, setBreakingArticles] = useState<{ id: string; title: string }[]>([]);
  const [dateLabel, setDateLabel] = useState('');
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const raw = localStorage.getItem('user');
    if (token && raw) {
      try { JSON.parse(raw); setLoggedIn(true); }
      catch { localStorage.removeItem('user_token'); localStorage.removeItem('user'); }
    }
    const now = new Date();
    const gregorian = new Intl.DateTimeFormat('ar-JO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    let hijri = '';
    try { hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(now); } catch {}
    setDateLabel(hijri ? `${gregorian} • ${hijri}` : gregorian);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!apiUrl) return;
    fetch(`${apiUrl}/articles/breaking`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled) return;
        const raw = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
        setBreakingArticles(raw.filter((item: { id?: string; title?: string }) => item?.id && typeof item.title === 'string' && item.title.trim()).slice(0, 8).map((item: { id: string; title: string }) => ({ id: item.id, title: item.title.trim() })));
      }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileOpen(false); return; }
      if (event.key !== 'Tab' || !mobileNavRef.current) return;
      const focusable = Array.from(mobileNavRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => mobileNavRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus());
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; (menuTriggerRef.current ?? previousActive)?.focus?.(); };
  }, [mobileOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSearchOpen(false); };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);


  useEffect(() => {
    if (!searchOpen || searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      if (!apiUrl) return;
      setSearchLoading(true);
      try {
        const response = await fetch(`${apiUrl}/articles?page=1&limit=60`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.articles) ? data.articles : Array.isArray(data?.data) ? data.data : [];
        const q = searchQuery.trim().toLocaleLowerCase('ar');
        setSearchResults(items.filter((item: { id?: string; title?: string }) => item?.id && item?.title?.toLocaleLowerCase('ar').includes(q)).slice(0, 7));
      } catch (error) { if ((error as Error).name !== 'AbortError') setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 280);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [searchOpen, searchQuery]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) { touchStartX.current = event.touches[0]?.clientX ?? null; touchCurrentX.current = touchStartX.current; }
  function handleTouchMove(event: TouchEvent<HTMLDivElement>) { touchCurrentX.current = event.touches[0]?.clientX ?? touchCurrentX.current; }
  function handleTouchEnd() { if (touchStartX.current !== null && touchCurrentX.current !== null && Math.abs(touchCurrentX.current - touchStartX.current) >= 70) setMobileOpen(false); touchStartX.current = null; touchCurrentX.current = null; }
  const active = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header className="mada-header">
        <div className="mada-topbar">
          <div className="mada-container mada-topbar-inner">
            <span className="mada-date">{dateLabel || 'مدى العالم • الأخبار لحظة بلحظة'}</span>
            <div className="mada-topbar-actions"><span className="mada-app-label">تطبيق مدى العالم</span><ThemeToggle /></div>
          </div>
        </div>
        <div className="mada-container mada-header-inner">
          <Link href="/" className="mada-brand" aria-label="مدى العالم">
            <Image className="mada-brand-logo" src="/icons/icon-512.png" alt="" width={48} height={48} priority />
            <span className="mada-brand-copy"><strong>مدى العالم</strong><span>MADA ALALAM</span></span>
          </Link>
          <nav className="mada-nav" aria-label="التنقل الرئيسي">
            <Link className={`mada-nav-link ${active('/') ? 'active' : ''}`} href="/">الرئيسية</Link>
            {headerCategories.map(([label, value]) => <Link key={value} className="mada-nav-link" href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>)}
            <Link className={`mada-nav-link ${active('/sports') ? 'active' : ''}`} href="/sports">الرياضة</Link>
          </nav>
          <div className="mada-header-actions">
            <button className="mada-action-icon" onClick={() => setSearchOpen(true)} aria-label="البحث في الأخبار"><SearchIcon /></button>
            <Link className="mada-action-icon mada-desktop-action" href={loggedIn ? '/favorites' : '/login'} aria-label="المفضلة"><HeartIcon /></Link>
            <Link className="mada-account-action mada-desktop-action" href={loggedIn ? '/account' : '/login'}><UserIcon /><span>{loggedIn ? 'حسابي' : 'دخول'}</span></Link>
            <button className="mada-menu mada-action-icon" ref={menuTriggerRef} aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileOpen} aria-controls="mada-mobile-nav" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>

      <div className="mada-breaking-shell">
        <div className="mada-breaking-ticker" aria-label="آخر الأخبار العاجلة">
        <div className="mada-breaking-label"><span className="mada-breaking-dot" aria-hidden="true" /><span>عاجل</span></div>
        <div className="mada-breaking-track"><div className={`mada-breaking-items ${tickerPaused ? 'is-paused' : ''}`}>
          {(breakingArticles.length ? breakingArticles : [{ id: 'fallback-1', title: 'تابع آخر الأخبار والتطورات لحظة بلحظة' }]).map(article => <Link key={article.id} href={article.id.startsWith('fallback') ? '/' : `/articles/${article.id}`} className="mada-breaking-item">{article.title}</Link>)}
          {(breakingArticles.length ? breakingArticles : [{ id: 'fallback-2', title: 'تابع آخر الأخبار والتطورات لحظة بلحظة' }]).map(article => <Link key={`copy-${article.id}`} href={article.id.startsWith('fallback') ? '/' : `/articles/${article.id}`} className="mada-breaking-item" aria-hidden="true" tabIndex={-1}>{article.title}</Link>)}
        </div></div>
        <button className="mada-ticker-control" type="button" onClick={() => setTickerPaused(v => !v)} aria-label={tickerPaused ? 'تشغيل شريط الأخبار' : 'إيقاف شريط الأخبار'}>{tickerPaused ? '▶' : 'Ⅱ'}</button>
        </div>
      </div>

      {searchOpen && <div className="mada-search-modal" role="dialog" aria-modal="true" aria-label="البحث في مدى العالم" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
        <div className="mada-search-panel">
          <div className="mada-search-panel-head"><div><span>استكشف الأخبار</span><strong>ماذا تريد أن تقرأ؟</strong></div><button onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث">✕</button></div>
          <div className="mada-search-field"><SearchIcon /><input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="اكتب عنوان الخبر الذي تبحث عنه" aria-label="البحث" /></div>
          {searchQuery.trim().length >= 2 && <div className="mada-search-results" aria-live="polite">{searchLoading ? <p>جارٍ البحث...</p> : searchResults.length ? searchResults.map(item => <Link key={item.id} href={`/articles/${encodeURIComponent(item.id)}`}><span>{item.source?.name || 'مدى العالم'}</span><strong>{item.title}</strong></Link>) : <p>لا توجد نتائج مطابقة في أحدث الأخبار.</p>}</div>}
          <div className="mada-search-categories">{categories.map(([label, value]) => <Link key={value} href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>)}</div>
          <Link className="mada-search-all" href="/categories">عرض جميع الأخبار والأقسام ←</Link>
        </div>
      </div>}

      {mobileOpen && <button type="button" className="mada-mobile-backdrop lg:hidden" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}
      {mobileOpen && <div id="mada-mobile-nav" ref={mobileNavRef} className="mada-mobile-nav lg:hidden is-open" role="dialog" aria-modal="true" aria-label="قائمة التنقل على الهاتف" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="mada-mobile-nav-inner">
          <div className="mada-mobile-nav-header"><Link href="/" className="mada-brand"><Image className="mada-brand-logo" src="/icons/icon-512.png" alt="" width={42} height={42} /><span className="mada-brand-copy"><strong>مدى العالم</strong><span>MADA ALALAM</span></span></Link><button type="button" className="mada-mobile-close" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}>✕</button></div>
          <div className="mada-mobile-nav-grid"><Link className={active('/') ? 'active' : ''} href="/">الرئيسية</Link><Link href="/sports">الرياضة</Link><Link href={loggedIn ? '/favorites' : '/login'}>المفضلة</Link><Link href={loggedIn ? '/account' : '/login'}>{loggedIn ? 'الحساب' : 'تسجيل الدخول'}</Link>{categories.map(([label, value]) => <Link key={value} href={`/categories?category=${encodeURIComponent(value)}`}>{label}</Link>)}</div>
          <div className="mada-mobile-nav-footer"><ThemeToggle /><span>الوضع الليلي</span></div>
        </div>
      </div>}
    </>
  );
}
