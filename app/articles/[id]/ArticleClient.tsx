'use client';

import Link from 'next/link';
import SafeImage from '../../components/SafeImage';
import { useEffect, useState } from 'react';

export interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string | null;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  isOriginal?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string;
  source?: {
    id: string;
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
  };
  category?: {
    id: string;
    name: string;
  };
}


const CATEGORY_LABELS: Record<string, string> = {
  World: 'العالم',
  Sports: 'الرياضة',
  Economy: 'اقتصاد',
  Technology: 'تكنولوجيا',
  Cars: 'سيارات',
  Variety: 'منوعات',
};

function categoryLabel(name?: string) {
  if (!name) return '';
  return CATEGORY_LABELS[name] ?? name;
}

function formatPublishedAt(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('ar-JO', {
    timeZone: 'Asia/Amman',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ArticleClient({
  initialArticle,
  relatedArticles = [],
}: {
  initialArticle: Article;
  relatedArticles?: Article[];
}) {
  const article = initialArticle;
  const id = article.id;
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    async function checkFavorite() {
      const token = localStorage.getItem('user_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !apiUrl) return;

      try {
        const response = await fetch(`${apiUrl}/bookmarks/${encodeURIComponent(id)}/check`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (response.status === 401) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite === true);
        }
      } catch {
        // Favorite state is non-blocking.
      }
    }

    checkFavorite();
  }, [id]);

  async function shareArticle() {
    const shareData = { title: article.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); setShareMessage('تم نسخ رابط الخبر.'); }
    } catch { /* Sharing is optional. */ }
  }

  async function copyArticleLink() {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage('تم نسخ رابط الخبر.'); }
    catch { setShareMessage('تعذر نسخ الرابط.'); }
  }

  async function toggleFavorite() {
    const token = localStorage.getItem('user_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setFavoriteMessage('تعذر الاتصال بالخدمة حاليًا.');
      return;
    }

    setFavoriteLoading(true);
    setFavoriteMessage('');

    try {
      const response = await fetch(`${apiUrl}/bookmarks/${encodeURIComponent(id)}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error(data?.message ?? 'تعذر تحديث المفضلة.');

      const nextState = !isFavorite;
      setIsFavorite(nextState);
      setFavoriteMessage(nextState ? 'تمت إضافة الخبر إلى المفضلة.' : 'تمت إزالة الخبر من المفضلة.');
    } catch (error) {
      setFavoriteMessage(error instanceof Error ? error.message : 'تعذر تحديث المفضلة.');
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <main className="mada-page mada-article-page" dir="rtl">
      <article className="mada-article-shell">
        <nav aria-label="مسار الصفحة" className="mada-breadcrumb">
          <Link href="/">الرئيسية</Link><span>←</span>
          {article.category?.name && <Link href={`/categories?category=${encodeURIComponent(article.category.name)}`}>{categoryLabel(article.category.name)}</Link>}
        </nav>

        <div className="mada-article-layout">
          <aside className="mada-share-rail" aria-label="مشاركة الخبر">
            <span>مشاركة</span>
            <button type="button" onClick={shareArticle} aria-label="مشاركة الخبر">↗</button>
            <button type="button" onClick={copyArticleLink} aria-label="نسخ رابط الخبر">⛓</button>
            <button type="button" onClick={toggleFavorite} disabled={favoriteLoading} aria-label="حفظ في المفضلة">{isFavorite ? '★' : '☆'}</button>
          </aside>

          <div className="mada-article-main">
            <header className="mada-article-header">
              <div className="mada-article-kicker">
                {article.category?.name && <Link href={`/categories?category=${encodeURIComponent(article.category.name)}`}>{categoryLabel(article.category.name)}</Link>}
                {article.isOriginal && <span>خاص مدى العالم</span>}
              </div>
              <h1>{article.title}</h1>
              {article.description && <p className="mada-article-deck">{article.description}</p>}
              <div className="mada-article-meta">
                {article.source?.logoUrl && <SafeImage src={article.source.logoUrl} alt="" width={36} height={36} />}
                <div><strong>{article.source?.name || 'مدى العالم'}</strong>{article.publishedAt && <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>}</div>
                <span className="mada-reading-time">قراءة سريعة</span>
              </div>
            </header>

            {article.imageUrl && <figure className="mada-article-cover"><SafeImage src={article.imageUrl} alt={article.title} width={1200} height={675} priority sizes="(max-width: 1024px) 100vw, 920px" /></figure>}

            {article.isOriginal && article.content && <section className="mada-article-body" aria-label="محتوى خاص مدى العالم">
              {article.content.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map((block, index) => block.startsWith('## ') ? <h2 key={index}>{block.slice(3).trim()}</h2> : <p key={index}>{block}</p>)}
            </section>}

            <section className="mada-article-actions" aria-label="خيارات الخبر">
              <div><strong>{article.isOriginal ? 'مادة خاصة من مدى العالم' : `المصدر: ${article.source?.name || 'المصدر الإخباري'}`}</strong><p>{article.isOriginal ? 'احفظ الخبر للعودة إليه لاحقًا أو شاركه مع الآخرين.' : 'يمكنك متابعة التفاصيل الكاملة من المصدر الأصلي أو حفظ الخبر في المفضلة.'}</p></div>
              <div className="mada-article-action-buttons">
                {!article.isOriginal && article.url && <a href={article.url} target="_blank" rel="noopener noreferrer nofollow">قراءة الخبر من المصدر ↗</a>}
                <button type="button" onClick={toggleFavorite} disabled={favoriteLoading}>{favoriteLoading ? 'جارٍ التحديث...' : isFavorite ? '★ محفوظ' : '☆ حفظ الخبر'}</button>
                <button type="button" onClick={shareArticle}>مشاركة</button>
              </div>
              {(favoriteMessage || shareMessage) && <p className="mada-status-message" role="status">{favoriteMessage || shareMessage}</p>}
            </section>
          </div>
        </div>

        {relatedArticles.length > 0 && <section className="mada-related" aria-labelledby="more-news-heading">
          <div className="mada-section-heading"><div><span>تابع التغطية</span><h2 id="more-news-heading">أخبار ذات صلة</h2></div><Link href="/">كل الأخبار ←</Link></div>
          <div className="mada-related-grid">{relatedArticles.map((item) => <Link key={item.id} href={`/articles/${encodeURIComponent(item.id)}`} className="mada-related-card">
            <div className="mada-related-image">{item.imageUrl ? <SafeImage src={item.imageUrl} alt="" width={480} height={300} sizes="(max-width: 620px) 120px, (max-width: 900px) 50vw, 25vw" /> : <span>مدى العالم</span>}</div>
            <div className="mada-related-copy"><span>{item.source?.name || categoryLabel(item.category?.name)}</span><h3>{item.title}</h3>{item.publishedAt && <time>{new Date(item.publishedAt).toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman', day: 'numeric', month: 'short' })}</time>}</div>
          </Link>)}</div>
        </section>}
      </article>
    </main>
  );
}
