'use client';

import Link from 'next/link';
import Stories from './components/Stories';
import NewsCard from './components/NewsCard';
import { useEffect, useState } from 'react';

type Article = { id: string; title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string; source?: { name: string }; category?: { name: string } };
const ARTICLES_PER_PAGE = 20;

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadArticles() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('لم يتم إعداد رابط الـAPI.');
        const params = new URLSearchParams({ page:String(page), limit:String(ARTICLES_PER_PAGE) });
        const response = await fetch(`${apiUrl}/articles?${params.toString()}`, { cache:'no-store' });
        if (!response.ok) throw new Error(`تعذر تحميل الأخبار (${response.status}).`);
        const data = await response.json();
        if (!mounted) return;
        setArticles(data.items ?? []); setTotalPages(data.totalPages ?? 1); setError('');
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : 'تعذر تحميل الأخبار.'); }
      finally { if (mounted) setLoading(false); }
    }
    setLoading(true); loadArticles();
    const interval = setInterval(loadArticles, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, [page]);

  useEffect(() => {
    async function loadFavorites() {
      const token = localStorage.getItem('user_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !apiUrl) { setFavoriteIds(new Set()); return; }
      try {
        const response = await fetch(`${apiUrl}/bookmarks`, { headers:{ Authorization:`Bearer ${token}` }, cache:'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const bookmarks = data.value ?? data;
        setFavoriteIds(new Set(bookmarks.map((a: Article) => a.id)));
      } catch { /* favorites are non-blocking */ }
    }
    loadFavorites();
  }, []);

  async function toggleFavorite(id: string) {
    const token = localStorage.getItem('user_token');
    if (!token) { window.location.href = '/login'; return; }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    const isFavorite = favoriteIds.has(id); setFavoriteLoading(id);
    try {
      const response = await fetch(`${apiUrl}/bookmarks/${id}`, { method:isFavorite ? 'DELETE' : 'POST', headers:{ Authorization:`Bearer ${token}` } });
      if (response.status === 401) { localStorage.removeItem('user_token'); localStorage.removeItem('user'); window.location.href='/login'; return; }
      if (!response.ok) throw new Error('تعذر تحديث المفضلة.');
      setFavoriteIds(prev => { const next = new Set(prev); isFavorite ? next.delete(id) : next.add(id); return next; });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحديث المفضلة.'); }
    finally { setFavoriteLoading(null); }
  }

  function goToPage(next: number) { if (next < 1 || next > totalPages || next === page) return; setPage(next); window.scrollTo({top:0,behavior:'smooth'}); }
  function pageNumbers(): (number|'ellipsis')[] {
    if (totalPages <= 7) return Array.from({length:totalPages},(_,i)=>i+1);
    const pages:(number|'ellipsis')[]=[1];
    if (page > 4) pages.push('ellipsis');
    for(let i=Math.max(2,page-1); i<=Math.min(totalPages-1,page+1); i++) pages.push(i);
    if (page < totalPages-3) pages.push('ellipsis');
    pages.push(totalPages); return pages;
  }

  return (
    <main className="mada-page">
      <div className="mada-container">
        <section className="mada-hero">
          <div className="mada-hero-grid">
            <div>
              <div className="mada-kicker mada-hero-kicker">MADA ALALAM</div>
              <h1>كل الأخبار التي تهمك، في مدى واحد.</h1>
              <p>منصة تجمع الأخبار من مصادر متعددة وتضعها أمامك في تجربة عربية سريعة، واضحة، ومرتبة حسب اهتماماتك.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                <a href="#latest" className="mada-btn mada-btn-hero-light">استكشف الأخبار ↓</a>
                <Link href="/sports" className="mada-btn mada-btn-hero-ghost">آخر الأخبار الرياضية</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mada-story-wrap"><Stories /></div>

        <section id="latest">
          <div className="mada-section-head"><div><div className="mada-kicker">News Feed</div><h2>أحدث الأخبار</h2><p>آخر ما وصل إلى مدى العالم من المصادر المتاحة.</p></div></div>
          {error && !loading && <div className="mada-error mb-5">{error}</div>}
          {loading ? <div className="mada-news-grid">{Array.from({length:6}).map((_,i)=><div className="mada-skeleton" key={i}><div className="mada-skeleton-body"><div className="mada-skeleton-line short"/><div className="mada-skeleton-line"/><div className="mada-skeleton-line"/></div></div>)}</div>
          : !error && articles.length === 0 ? <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار مطابقة</h3><p className="mada-subtitle">جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.</p></div>
          : <>
            <div className="mada-news-grid">{articles.map(article=><NewsCard key={article.id} article={article} favorite={favoriteIds.has(article.id)} favoriteLoading={favoriteLoading===article.id} onFavorite={()=>toggleFavorite(article.id)}/>)}</div>
            {totalPages > 1 && <div className="mada-pagination"><button className="mada-page-btn" onClick={()=>goToPage(page-1)} disabled={page===1}>السابق</button>{pageNumbers().map((n,i)=>n==='ellipsis'?<span key={`e${i}`} className="px-2 text-gray-400">…</span>:<button key={n} className={`mada-page-btn ${page===n?'active':''}`} onClick={()=>goToPage(n)}>{n}</button>)}<button className="mada-page-btn" onClick={()=>goToPage(page+1)} disabled={page===totalPages}>التالي</button></div>}
          </>}
        </section>
      </div>
    </main>
  );
}
