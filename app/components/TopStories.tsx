'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { optimizeImageUrl } from '../lib/optimized-image-url';

type Article = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: { name: string };
  category?: { name: string };
  isFeatured?: boolean;
  isPinned?: boolean;
};

function formatRelative(value?: string) {
  if (!value) return '';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

function summary(value?: string, limit = 145) {
  const text = value?.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

export default function TopStories({ articles, countryLabel }: { articles: Article[]; countryLabel: string }) {
  const ordered = useMemo(() => [...articles]
    .sort((a, b) => ((b.isPinned ? 4 : 0) + (b.isFeatured ? 2 : 0)) - ((a.isPinned ? 4 : 0) + (a.isFeatured ? 2 : 0)))
    .slice(0, 5), [articles]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (ordered.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % ordered.length), 7000);
    return () => window.clearInterval(timer);
  }, [ordered.length]);

  useEffect(() => {
    if (activeIndex >= ordered.length) setActiveIndex(0);
  }, [activeIndex, ordered.length]);

  if (!ordered.length) return null;
  const lead = ordered[activeIndex];
  const sidePool = ordered.filter((_, index) => index !== activeIndex).slice(0, 4);

  return (
    <section id="top-stories" className="mada-top-stories" aria-labelledby="top-stories-title">
      <div className="mada-editorial-section-head">
        <div>
          <span className="mada-section-eyebrow">TOP STORIES · {countryLabel.toUpperCase()}</span>
          <h2 id="top-stories-title">أهم ما يجري الآن</h2>
        </div>
        <Link href="#latest" className="mada-editorial-more">كل الأخبار <span>←</span></Link>
      </div>

      <div className="mada-hero-news-grid">
        <Link href={`/articles/${lead.id}`} className="mada-hero-news" aria-label={`فتح: ${lead.title}`}>
          <div className="mada-hero-news-image">
            {lead.imageUrl ? (
              <img
                src={optimizeImageUrl(lead.imageUrl, 1400)}
                alt=""
                width="1400"
                height="788"
                fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
                loading={activeIndex === 0 ? 'eager' : 'lazy'}
                sizes="(max-width: 780px) 100vw, 70vw"
              />
            ) : <div className="mada-image-placeholder">MADA</div>}
            <div className="mada-hero-overlay" />
            <span className="mada-hero-live">الأبرز</span>
            <div className="mada-hero-copy">
              <div className="mada-hero-meta"><span>{lead.category?.name || 'أخبار'}</span><i /><span>{lead.source?.name || 'مصدر إخباري'}</span><i /><span>{formatRelative(lead.publishedAt)}</span></div>
              <h3>{lead.title}</h3>
              {summary(lead.description) && <p>{summary(lead.description)}</p>}
              <span className="mada-hero-read">فتح الخبر <b>←</b></span>
            </div>
          </div>
        </Link>

        <div className="mada-news-side-column">
          {sidePool.map((article, index) => (
            <Link href={`/articles/${article.id}`} key={article.id} className="mada-news-side-item">
              <span className="mada-news-side-number">{String(index + 2).padStart(2, '0')}</span>
              <div className="mada-news-side-image">
                {article.imageUrl ? <img src={optimizeImageUrl(article.imageUrl, 420)} alt="" width="420" height="250" loading="lazy" sizes="132px" /> : <span>M</span>}
              </div>
              <div className="mada-news-side-copy">
                <div><span>{article.category?.name || 'أخبار'}</span><i /><span>{formatRelative(article.publishedAt)}</span></div>
                <h3>{article.title}</h3>
                <small>{article.source?.name || 'مصدر إخباري'}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mada-hero-dots" aria-label="التنقل بين أهم الأخبار">
        {ordered.map((article, index) => (
          <button key={article.id} type="button" className={index === activeIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={`الخبر ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined}>
            <span>{index + 1}</span><i />
          </button>
        ))}
      </div>
    </section>
  );
}
