'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import ThemeToggle from '../../components/ThemeToggle';

type Props = { children: ReactNode; title: string; eyebrow?: string };
type NavItem = { label: string; href: string; icon: string; badge?: string };
type NavSection = { title: string; items: NavItem[] };

export const adminNavigation: NavSection[] = [
  { title: 'مساحة العمل', items: [
    { label: 'لوحة التحكم', href: '/admin', icon: '▦' },
    { label: 'التحليلات', href: '/admin/analytics', icon: '◫' },
  ]},
  { title: 'المحتوى', items: [
    { label: 'الأخبار', href: '/admin/articles', icon: '▤' },
    { label: 'خاص مدى العالم', href: '/admin/original-content', icon: '★' },
    { label: 'الأخبار العاجلة', href: '/admin/breaking-news', icon: '!' },
    { label: 'التحكم التحريري', href: '/admin/editorial', icon: '✎' },
    { label: 'القصص', href: '/admin/stories', icon: '◉' },
    { label: 'المصادر', href: '/admin/sources', icon: '◈' },
    { label: 'التصنيفات', href: '/admin/categories', icon: '▱' },
    { label: 'الدول', href: '/admin/countries', icon: '◎' },
  ]},
  { title: 'التشغيل', items: [
    { label: 'المستورد Importer', href: '/admin/importer', icon: '↻' },
    { label: 'صحة المصادر', href: '/admin/source-health', icon: '♥' },
  ]},
  { title: 'الوسائط والرياضة', items: [
    { label: 'YouTube', href: '/admin/youtube', icon: '▶' },
    { label: 'القنوات المباشرة', href: '/admin/live-channels', icon: '▣' },
    { label: 'الرياضة', href: '/admin/sports', icon: '✦' },
  ]},
  { title: 'الإدارة', items: [
    { label: 'المستخدمون', href: '/admin/users', icon: '♙' },
    { label: 'الإعدادات', href: '/admin/settings', icon: '⚙' },
  ]},
];

export default function AdminShell({ children, title, eyebrow = 'مدى العالم / الإدارة' }: Props) {
  const pathname = usePathname();
  const [email, setEmail] = useState('Admin');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_user');
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string };
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {}
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  }

  const active = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  const allItems = adminNavigation.reduce<NavItem[]>((items, section) => items.concat(section.items), []);

  return (
    <div dir="rtl" className="admin-shell min-h-screen">
      <aside className="fixed inset-y-0 right-0 z-50 hidden w-[280px] flex-col border-l border-white/10 bg-[#07101f] text-white shadow-2xl lg:flex">
        <div className="flex h-[82px] items-center border-b border-white/10 px-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-3" aria-label="مركز إدارة مدى العالم">
            <span className="mada-brand-mark">م</span>
            <span className="min-w-0"><span className="block truncate text-[16px] font-black">MADA ALALAM</span><span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">News Control Center</span></span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="إدارة مدى العالم">
          {adminNavigation.map(section => <div key={section.title} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{section.title}</p>
            <div className="space-y-1">
              {section.items.map(item => <Link key={item.href} href={item.href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${active(item.href) ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                <span className="grid h-5 w-5 place-items-center text-sm" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                {active(item.href) && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>)}
            </div>
          </div>)}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-bold">{email.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-xs font-semibold">{email}</p><p className="text-[10px] text-slate-500">مدير النظام</p></div></div>
          <button onClick={logout} className="min-h-11 w-full rounded-xl px-3 py-2.5 text-right text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">↪ تسجيل الخروج</button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[290px] flex-col bg-[#07101f] text-white shadow-2xl transition-transform lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5"><Link href="/admin" className="flex items-center gap-2 font-black"><span className="mada-brand-mark" style={{width:36,height:36,borderRadius:11}}>م</span>MADA ALALAM</Link><button aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white">✕</button></div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="قائمة الإدارة على الهاتف">
          {allItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active(item.href) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
        </nav>
      </aside>

      <div className="min-h-screen lg:pr-[280px]">
        <header className="admin-page-header sticky top-0 z-30 flex min-h-[78px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} aria-label="فتح قائمة الإدارة" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden">☰</button><div><p className="text-[11px] font-semibold text-slate-400">{eyebrow}</p><h1 className="text-lg font-black tracking-tight">{title}</h1></div></div>
          <div className="flex items-center gap-2"><Link href="/" target="_blank" className="hidden min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex">فتح الموقع ↗</Link><ThemeToggle admin /><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white">{email.slice(0,1).toUpperCase()}</div></div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
