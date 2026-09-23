'use client';

import Link from 'next/link';
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
    <main className="mada-page min-h-screen bg-transparent" dir="rtl">
      <article className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="مسار الصفحة" className="mb-6 text-sm font-medium text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition hover:text-blue-700">الرئيسية</Link></li>
              {article.category?.name && (
                <>
                  <li aria-hidden="true" className="text-slate-300">←</li>
                  <li>
                    <Link href={`/categories?category=${encodeURIComponent(article.category.name)}`} className="transition hover:text-blue-700">
                      {categoryLabel(article.category.name)}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          <header className="border-b border-slate-200 pb-7">
            {article.isOriginal && <div className="mb-3"><span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">خاص مدى العالم</span></div>}
            <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
              {article.source?.name && <span className="font-bold text-blue-700">{article.source.name}</span>}
              {article.source?.name && article.publishedAt && <span className="text-slate-300" aria-hidden="true">•</span>}
              {article.publishedAt && <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>}
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.35] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
          </header>

          {article.description && (
            <p className="mt-7 text-lg font-medium leading-9 text-slate-700 sm:text-xl sm:leading-10">
              {article.description}
            </p>
          )}

          {article.imageUrl && (
            <figure className="mt-7 overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/70">
              <img
                src={article.imageUrl}
                alt={article.title}
                width={1200}
                height={675}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 896px"
                className="aspect-video w-full object-cover"
              />
            </figure>
          )}

          {article.isOriginal && article.content && (
            <section className="mt-8 rounded-2xl bg-white text-[17px] leading-9 text-slate-800" aria-label="محتوى خاص مدى العالم">
              {article.content
                .replace(/\r\n/g, '\n')
                .split(/\n\s*\n/)
                .map((block) => block.trim())
                .filter(Boolean)
                .map((block, index) =>
                  block.startsWith('## ') ? (
                    <h2 key={index} className="mb-3 mt-8 text-2xl font-black leading-10 text-slate-950 first:mt-0">
                      {block.slice(3).trim()}
                    </h2>
                  ) : (
                    <p key={index} className="mb-5 whitespace-pre-wrap leading-9 last:mb-0">
                      {block}
                    </p>
                  ),
                )}
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="خيارات الخبر">
            <p className="leading-8 text-slate-600">
              {article.isOriginal
                ? 'هذه مادة خاصة من إعداد مدى العالم. يمكنك حفظها في المفضلة للعودة إليها لاحقًا.'
                : 'هذا الخبر منقول من مصدره الإخباري. يمكنك متابعة التفاصيل الكاملة من المصدر الأصلي.'}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {!article.isOriginal && article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
                >
                  متابعة قراءة الخبر من المصدر
                  <span className="mr-2" aria-hidden="true">↗</span>
                </a>
              )}

              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`inline-flex min-h-12 items-center justify-center rounded-xl border px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isFavorite
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {favoriteLoading ? 'جارٍ التحديث...' : isFavorite ? '★ إزالة من المفضلة' : '☆ إضافة إلى المفضلة'}
              </button>
            </div>

            {favoriteMessage && (
              <p className="mt-4 text-sm text-slate-600" role="status">{favoriteMessage}</p>
            )}
          </section>
        </div>

        {relatedArticles.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-9" aria-labelledby="more-news-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-sm font-bold text-blue-700">مدى العالم</p>
                <h2 id="more-news-heading" className="text-2xl font-extrabold text-slate-950 sm:text-3xl">المزيد من الأخبار</h2>
              </div>
              <Link href="/" className="text-sm font-bold text-blue-700 transition hover:text-blue-900">عرض أحدث الأخبار</Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArticles.map((item) => (
                <Link
                  key={item.id}
                  href={`/articles/${encodeURIComponent(item.id)}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm font-bold text-slate-400">مدى العالم</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                      {item.source?.name && <span className="font-semibold text-blue-700">{item.source.name}</span>}
                      {item.publishedAt && <span>• {new Date(item.publishedAt).toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman', day: 'numeric', month: 'short' })}</span>}
                    </div>
                    <h3 className="line-clamp-3 text-base font-bold leading-7 text-slate-900 transition group-hover:text-blue-700">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
