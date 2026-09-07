'use client';

import Link from 'next/link';
import Stories from './components/Stories';
import NewsCard from './components/NewsCard';
import { FormEvent, useEffect, useState } from 'react';

type Category = { id: string; name: string };
type Country = { id: string; name: string; nameEn: string; code: string; flag: string };
type Source = { id: string; name: string; categoryId?: string };
type Article = { id: string; title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string; source?: { name: string }; category?: { name: string } };
const ARTICLES_PER_PAGE = 20;

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) { setError('لم يتم إعداد رابط الـAPI.'); setLoading(false); return; }
    async function loadFilters() {
      try {
        const [c, s, countriesResponse] = await Promise.all([
          fetch(`${apiUrl}/categories`, { cache:'no-store' }),
          fetch(`${apiUrl}/sources`, { cache:'no-store' }),
          fetch(`${apiUrl}/countries`, { cache:'no-store' }),
        ]);
        if (!c.ok || !s.ok || !countriesResponse.ok) throw new Error('تعذر تحميل خيارات التصفية.');
        const [categoriesData, sourcesData, countriesData] = await Promise.all([c.json(), s.json(), countriesResponse.json()]);
        setCategories(categoriesData.value ?? categoriesData);
        setSources(sourcesData.value ?? sourcesData);
        const order = ['JO','SY','EG','SA','AE','QA','KW','BH','OM','YE','IQ','LB','PS','LY','TN','DZ','MA','SD'];
        const loaded = countriesData.value ?? countriesData;
        setCountries([...loaded].sort((a: Country,b: Country) => {
          const ai = order.indexOf(a.code), bi = order.indexOf(b.code);
          return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
        }));
      } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل البيانات.'); }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadArticles() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('لم يتم إعداد رابط الـAPI.');
        const params = new URLSearchParams({ page:String(page), limit:String(ARTICLES_PER_PAGE) });
        if (activeSearch.trim()) params.set('search', activeSearch.trim());
        if (categoryId) params.set('categoryId', categoryId);
        if (sourceId) params.set('sourceIds', sourceId);
        if (countryCode) params.set('countryCode', countryCode);
        const response = await fetch(`${apiUrl}/articles?${params.toString()}`, { cache:'no-store' });
        if (!response.ok) throw new Error(`تعذر تحميل الأخبار (${response.status}).`);
        const data = await response.json();
        if (!mounted) return;
        setArticles(data.items ?? []); setTotalArticles(data.total ?? 0); setTotalPages(data.totalPages ?? 1); setError('');
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : 'تعذر تحميل الأخبار.'); }
      finally { if (mounted) setLoading(false); }
    }
    setLoading(true); loadArticles();
    const interval = setInterval(loadArticles, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, [activeSearch, categoryId, sourceId, countryCode, page]);

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

  function submitSearch(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setPage(1); setError(''); setActiveSearch(search.trim()); }
  function clearFilters() { setSearch(''); setActiveSearch(''); setCategoryId(''); setSourceId(''); setCountryCode(''); setPage(1); }

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

  const hasFilters = Boolean(activeSearch || countryCode || categoryId || sourceId);

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
            <div className="mada-hero-stat"><span>إجمالي الأخبار المتاحة</span><strong>{totalArticles.toLocaleString('ar-JO')}</strong><span>تتحدث المنصة تلقائيًا كل دقيقة</span></div>
          </div>
        </section>

        <div className="mada-story-wrap"><Stories /></div>

        <section className="mada-surface mada-filter" aria-label="البحث والتصفية">
          <div className="mada-section-head"><div><div className="mada-kicker">استكشف</div><h2>ابحث وصَفِّ الأخبار</h2></div><span className="mada-result-count">{hasFilters ? `${totalArticles.toLocaleString('ar-JO')} نتيجة` : 'أحدث الأخبار أولًا'}</span></div>
          <form id="news-search" onSubmit={submitSearch} className="mada-filter-grid">
            <div className="mada-search"><span className="mada-search-icon">⌕</span><input className="mada-input" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن خبر، موضوع أو كلمة مفتاحية..." /></div>
            <select className="mada-select" value={countryCode} onChange={e=>{setCountryCode(e.target.value);setPage(1)}}><option value="">كل الدول</option>{countries.map(c=><option key={c.id} value={c.code}>{c.flag} {c.name}</option>)}</select>
            <select className="mada-select" value={categoryId} onChange={e=>{setCategoryId(e.target.value);setPage(1)}}><option value="">كل الأقسام</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select className="mada-select" value={sourceId} onChange={e=>{setSourceId(e.target.value);setPage(1)}}><option value="">كل المصادر</option>{sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </form>
          <div className="mada-filter-footer"><span className="mada-result-count">يتم تحديث الأخبار تلقائيًا.</span><div className="flex gap-2">{hasFilters && <button className="mada-btn mada-btn-ghost" type="button" onClick={clearFilters}>مسح التصفية</button>}<button className="mada-btn mada-btn-primary" type="submit" form="news-search">بحث</button></div></div>
        </section>

        <section id="latest">
          <div className="mada-section-head"><div><div className="mada-kicker">News Feed</div><h2>{activeSearch ? `نتائج البحث عن «${activeSearch}»` : 'أحدث الأخبار'}</h2><p>آخر ما وصل إلى مدى العالم من المصادر المتاحة.</p></div></div>
          {error && !loading && <div className="mada-error mb-5">{error}</div>}
          {loading ? <div className="mada-news-grid">{Array.from({length:6}).map((_,i)=><div className="mada-skeleton" key={i}><div className="mada-skeleton-body"><div className="mada-skeleton-line short"/><div className="mada-skeleton-line"/><div className="mada-skeleton-line"/></div></div>)}</div>
          : !error && articles.length === 0 ? <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار مطابقة</h3><p className="mada-subtitle">جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.</p>{hasFilters && <button className="mada-btn mada-btn-primary mt-5" onClick={clearFilters}>عرض كل الأخبار</button>}</div>
          : <>
            <div className="mada-news-grid">{articles.map(article=><NewsCard key={article.id} article={article} favorite={favoriteIds.has(article.id)} favoriteLoading={favoriteLoading===article.id} onFavorite={()=>toggleFavorite(article.id)}/>)}</div>
            {totalPages > 1 && <div className="mada-pagination"><button className="mada-page-btn" onClick={()=>goToPage(page-1)} disabled={page===1}>السابق</button>{pageNumbers().map((n,i)=>n==='ellipsis'?<span key={`e${i}`} className="px-2 text-gray-400">…</span>:<button key={n} className={`mada-page-btn ${page===n?'active':''}`} onClick={()=>goToPage(n)}>{n}</button>)}<button className="mada-page-btn" onClick={()=>goToPage(page+1)} disabled={page===totalPages}>التالي</button></div>}
          </>}
        </section>
      </div>
    </main>
  );
}
