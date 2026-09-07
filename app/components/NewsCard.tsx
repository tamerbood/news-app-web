'use client';

import Link from 'next/link';

type Article = {
  id: string; title: string; description?: string; url?: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

export default function NewsCard({ article, favorite, favoriteLoading, onFavorite }: {
  article: Article; favorite: boolean; favoriteLoading: boolean; onFavorite: () => void;
}) {
  const image = article.imageUrl?.trim() || `${process.env.NEXT_PUBLIC_API_URL}/assets/images/news-placeholder.png`;
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ar-JO', { day:'numeric', month:'short', year:'numeric' }) : '';

  return (
    <article className="mada-news-card">
      <Link href={`/articles/${article.id}`} aria-label={`قراءة: ${article.title}`} className="block">
        <div className="mada-news-media">
          <img src={image} alt="" loading="lazy" />
          <div className="mada-news-overlay">
            {article.category?.name && <span className="mada-pill">{article.category.name}</span>}
            {article.source?.name && <span className="mada-pill mada-pill-dark">{article.source.name}</span>}
          </div>
        </div>
      </Link>
      <div className="mada-news-body">
        <div className="mada-news-meta">
          {article.category?.name && <span className="mada-ui-badge mada-ui-badge-info">{article.category.name}</span>}
          {article.publishedAt && <span className="mada-ui-badge mada-ui-badge-neutral">{date}</span>}
        </div>
        <h3><Link href={`/articles/${article.id}`}>{article.title}</Link></h3>
        {article.description && <p className="mada-news-description">{article.description}</p>}
        <div className="mada-news-footer">
          <span className="mada-news-date">{article.source?.name ?? 'مدى العالم'}</span>
          <div className="flex gap-2">
            <button className={`mada-icon-btn ${favorite ? 'saved' : ''}`} onClick={onFavorite} disabled={favoriteLoading} aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>{favoriteLoading ? '…' : favorite ? '★' : '☆'}</button>
            <Link className="mada-btn mada-btn-primary" href={`/articles/${article.id}`}>قراءة الخبر</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
