'use client';

import Link from 'next/link';
import Stories from './components/Stories';
import NewsCard from './components/NewsCard';
import { useEffect, useState } from 'react';

type Article = { id: string; title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string; source?: { name: string }; category?: { name: string } };
const ARTICLES_PER_PAGE = 20;
const TOP_STORIES_COUNT = 5;
const LATEST_COUNT = 8;
const MAX_CATEGORY_ITEMS = 4;

type Story = {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType?: string;
  actionUrl?: string | null;
  sourceId?: string | null;
  isActive: boolean;
  sortOrder?: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  sourceName?: string | null;
  sourceLogoUrl?: string | null;
};

export default function HomeClient({
  initialArticles,
  initialTotalPages,
  initialStories,
}: {
  initialArticles: Article[];
  initialTotalPages: number;
  initialStories: Story[];
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setInterval> | undefined;

    async function loadArticles(showLoading = true) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error('لم يتم إعداد رابط الـAPI.');
        const params = new URLSearchParams({ page:String(page), limit:String(ARTICLES_PER_PAGE) });
        const response = await fetch(`${apiUrl}/articles?${params.toString()}`, { cache:'no-store' });
        if (!response.ok) throw new Error(`تعذر تحميل الأخبار (${response.status}).`);
        const data = await response.json();
        if (!mounted) return;
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const uniqueItems: Article[] = Array.from(
          new Map<string, Article>(
            rawItems.filter((item: Article) => item?.id).map((item: Article) => [item.id, item]),
          ).values(),
        );
        setArticles(uniqueItems); setTotalPages(data.totalPages ?? 1); setError('');
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : 'تعذر تحميل الأخبار.'); }
      finally { if (mounted && showLoading) setLoading(false); }
    }

    const hasServerData = page === 1 && initialArticles.length > 0;
    if (!hasServerData) {
      setLoading(true);
      void loadArticles();
    } else {
      setLoading(false);
    }

    refreshTimer = setInterval(() => {
      void loadArticles(false);
    }, 60000);

    return () => {
      mounted = false;
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [page, initialArticles.length]);

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

  // Distribute the current API page into sections without ever reusing an article.
  // The same article id can appear in only one section on this page.
  const topStories = articles.slice(0, TOP_STORIES_COUNT);
  const leadArticle = topStories[0] ?? null;
  const supportingArticles = topStories.slice(1);
  const latestArticles = articles.slice(TOP_STORIES_COUNT, TOP_STORIES_COUNT + LATEST_COUNT);
  const categorySourceArticles = articles.slice(TOP_STORIES_COUNT + LATEST_COUNT);
  const categoryGroups = Array.from(
    categorySourceArticles.reduce((groups, article) => {
      const name = article.category?.name?.trim() || 'منوعات';
      const current = groups.get(name) ?? [];
      if (current.length < MAX_CATEGORY_ITEMS) current.push(article);
      groups.set(name, current);
      return groups;
    }, new Map<string, Article[]>()).entries(),
  );

  function formatDate(value?: string) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch { return ''; }
  }

  return (
    <main className="mada-page">
      <div className="mada-container">
        <section className="mada-hero">
          <div className="mada-hero-grid">
            <div>
              <div className="mada-kicker mada-hero-kicker">MADA ALALAM</div>
              <h1>مدى العالم — كل الأخبار التي تهمك، في مدى واحد.</h1>
              <p>منصة تجمع الأخبار من مصادر متعددة وتضعها أمامك في تجربة عربية سريعة، واضحة، ومرتبة حسب اهتماماتك.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                <a href="#top-stories" className="mada-btn mada-btn-hero-light">أهم الأخبار الآن ↓</a>
                <Link href="/sports" className="mada-btn mada-btn-hero-ghost">آخر الأخبار الرياضية</Link>
              </div>
            </div>
          </div>
        </section>

        {leadArticle && !loading && !error && (
          <section id="top-stories" className="mada-top-stories" aria-labelledby="top-stories-title">
            <div className="mada-section-head">
              <div><div className="mada-kicker">Top Stories</div><h2 id="top-stories-title">أهم الأخبار الآن</h2><p>أبرز ما يستحق انتباهك من آخر الأخبار الواردة.</p></div>
            </div>
            <div className="mada-top-stories-grid">
              <Link href={`/articles/${leadArticle.id}`} className="mada-lead-story">
                <div className="mada-lead-story-media">
                  {leadArticle.imageUrl ? <img src={leadArticle.imageUrl} alt="" width="1280" height="720" fetchPriority="high" loading="eager" decoding="async" /> : <div className="mada-lead-story-placeholder">MADA</div>}
                  <span className="mada-story-category">{leadArticle.category?.name || 'أخبار'}</span>
                </div>
                <div className="mada-lead-story-body">
                  <div className="mada-story-meta">{leadArticle.source?.name || 'مصدر إخباري'}{formatDate(leadArticle.publishedAt) ? ` • ${formatDate(leadArticle.publishedAt)}` : ''}</div>
                  <h3>{leadArticle.title}</h3>
                  {leadArticle.description && <p>{leadArticle.description}</p>}
                </div>
              </Link>

              <div className="mada-supporting-stories">
                {supportingArticles.map((article) => (
                  <Link href={`/articles/${article.id}`} key={article.id} className="mada-supporting-story">
                    <div className="mada-supporting-story-media">
                      {article.imageUrl ? <img src={article.imageUrl} alt="" width="112" height="88" loading="lazy" decoding="async" /> : <div className="mada-story-placeholder">M</div>}
                    </div>
                    <div className="mada-supporting-story-body">
                      <span>{article.category?.name || 'أخبار'}</span>
                      <h3>{article.title}</h3>
                      <p>{article.source?.name || 'مصدر إخباري'}{formatDate(article.publishedAt) ? ` • ${formatDate(article.publishedAt)}` : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mada-story-wrap"><Stories initialStories={initialStories} /></div>

        <section id="latest">
          <div className="mada-section-head"><div><div className="mada-kicker">Latest</div><h2>آخر الأخبار</h2><p>تصفح الأخبار زمنيًا، من الأحدث إلى الأقدم.</p></div></div>
          {error && !loading && <div className="mada-error mb-5">{error}</div>}
          {loading ? <div className="mada-news-grid">{Array.from({length:6}).map((_,i)=><div className="mada-skeleton" key={i}><div className="mada-skeleton-body"><div className="mada-skeleton-line short"/><div className="mada-skeleton-line"/><div className="mada-skeleton-line"/></div></div>)}</div>
          : !error && articles.length === 0 ? <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار</h3><p className="mada-subtitle">لا توجد أخبار متاحة حاليًا.</p></div>
          : <>
            <div className="mada-news-grid">{latestArticles.map(article=><NewsCard key={article.id} article={article} favorite={favoriteIds.has(article.id)} favoriteLoading={favoriteLoading===article.id} onFavorite={()=>toggleFavorite(article.id)}/>)}</div>
            {totalPages > 1 && <div className="mada-pagination"><button className="mada-page-btn" onClick={()=>goToPage(page-1)} disabled={page===1}>السابق</button>{pageNumbers().map((n,i)=>n==='ellipsis'?<span key={`e${i}`} className="px-2 text-gray-400">…</span>:<button key={n} className={`mada-page-btn ${page===n?'active':''}`} onClick={()=>goToPage(n)}>{n}</button>)}<button className="mada-page-btn" onClick={()=>goToPage(page+1)} disabled={page===totalPages}>التالي</button></div>}
          </>}
        </section>

        {!loading && !error && categoryGroups.length > 0 && (
          <section className="mada-category-sections" aria-label="الأخبار حسب الأقسام">
            {categoryGroups.slice(0, 6).map(([category, items]) => (
              <div className="mada-category-block" key={category}>
                <div className="mada-section-head"><div><div className="mada-kicker">Category</div><h2>{category}</h2></div><Link href={`/categories`} className="mada-category-more">عرض المزيد ←</Link></div>
                <div className="mada-category-grid">
                  {items.map(article => <NewsCard key={`${category}-${article.id}`} article={article} favorite={favoriteIds.has(article.id)} favoriteLoading={favoriteLoading===article.id} onFavorite={()=>toggleFavorite(article.id)}/>) }
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
