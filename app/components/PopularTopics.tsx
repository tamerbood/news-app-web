'use client';

import SafeImage from './SafeImage';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { optimizeImageUrl } from '../lib/optimized-image-url';

type Article = {
  id: string;
  title: string;
  imageUrl?: string;
  category?: { name?: string };
  source?: { name?: string };
  viewCount?: number;
  views?: number;
  publishedAt?: string;
};

function viewsOf(article: Article) {
  const value = article.viewCount ?? article.views;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function displayViews(value: number) {
  return new Intl.NumberFormat('ar', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export default function PopularTopics({ articles }: { articles: Article[] }) {
  const [tab, setTab] = useState<'read' | 'trending'>('read');
  const hasViews = articles.some((article) => viewsOf(article) !== null);
  const items = useMemo(() => {
    const source = [...articles].slice(0, 12);
    if (tab === 'read' && hasViews) {
      return source.sort((a, b) => (viewsOf(b) ?? -1) - (viewsOf(a) ?? -1)).slice(0, 6);
    }
    return source
      .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
      .slice(0, 6);
  }, [articles, hasViews, tab]);

  if (!items.length) return null;

  return (
    <section className="mada-popular-section" aria-labelledby="popular-title">
      <div className="mada-popular-head">
        <div>
          <span className="mada-section-eyebrow">AUDIENCE SIGNALS</span>
          <h2 id="popular-title">الأكثر قراءة</h2>
        </div>
        <div className="mada-popular-tabs" role="tablist" aria-label="الأخبار الشائعة">
          <button type="button" className={tab === 'read' ? 'is-active' : ''} onClick={() => setTab('read')} role="tab" aria-selected={tab === 'read'}>الأكثر قراءة</button>
          <button type="button" className={tab === 'trending' ? 'is-active' : ''} onClick={() => setTab('trending')} role="tab" aria-selected={tab === 'trending'}>مواضيع شائعة</button>
        </div>
      </div>

      {!hasViews && tab === 'read' && <p className="mada-popular-note">تظهر الآن المواضيع الأحدث حتى تتوفر إحصاءات القراءة من النظام.</p>}

      <div className="mada-popular-grid">
        {items.map((article, index) => {
          const viewCount = viewsOf(article);
          return (
            <Link href={`/articles/${article.id}`} className="mada-popular-item" key={article.id}>
              <span className="mada-popular-number">{index + 1}</span>
              <div className="mada-popular-image">
                <SafeImage src={article.imageUrl ? optimizeImageUrl(article.imageUrl, 260) : '/icons/icon-512.png'} alt="" width={172} height={128} loading="lazy" sizes="86px" />
              </div>
              <div className="mada-popular-copy">
                <div className="mada-popular-meta"><span>{article.category?.name || 'أخبار'}</span><i /><span>{article.source?.name || 'مصدر إخباري'}</span></div>
                <h3>{article.title}</h3>
                {viewCount !== null && <span className="mada-popular-views">● {displayViews(viewCount)} مشاهدة</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
