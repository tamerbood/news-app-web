import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import { optimizeImageUrl } from '../lib/optimized-image-url';

type Article = {
  id: string; title: string; description?: string; url?: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
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

function compactDescription(value?: string, limit = 105) {
  const text = value?.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

export default function NewsCard({ article, variant = 'standard' }: { article: Article; variant?: 'standard' | 'compact' }) {
  const image = article.imageUrl?.trim() || `${process.env.NEXT_PUBLIC_API_URL}/assets/images/news-placeholder.png`;
  const summary = compactDescription(article.description, variant === 'compact' ? 80 : 105);

  if (variant === 'compact') {
    return (
      <article className="mada-news-card mada-news-card-compact">
        <Link href={`/articles/${article.id}`} className="mada-compact-image" aria-label={`قراءة: ${article.title}`}>
          <img src={optimizeImageUrl(image, 420)} alt="" width="420" height="260" loading="lazy" decoding="async" sizes="180px" />
        </Link>
        <div className="mada-compact-copy">
          <div className="mada-news-meta-line"><span>{article.category?.name || 'أخبار'}</span><i /><span>{formatRelative(article.publishedAt)}</span></div>
          <h3><Link href={`/articles/${article.id}`}>{article.title}</Link></h3>
          <span className="mada-compact-source">{article.source?.name || 'مصدر إخباري'}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="mada-news-card">
      <Link href={`/articles/${article.id}`} className="mada-news-media" aria-label={`قراءة: ${article.title}`}>
        <img src={optimizeImageUrl(image, 620)} alt="" width="620" height="350" loading="lazy" decoding="async" sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 33vw" />
        {article.category?.name && <span className="mada-news-category">{article.category.name}</span>}
      </Link>
      <div className="mada-news-body">
        <div className="mada-news-meta-line"><span>{article.source?.name || 'مصدر إخباري'}</span><i /><span>{formatRelative(article.publishedAt)}</span></div>
        <h3><Link href={`/articles/${article.id}`} className="mada-news-title-link">{article.title}</Link></h3>
        {summary && <p className="mada-news-description">{summary}</p>}
        <div className="mada-news-footer">
          <Link href={`/articles/${article.id}`} className="mada-card-read">قراءة الخبر <span>←</span></Link>
          <FavoriteButton id={article.id} />
        </div>
      </div>
    </article>
  );
}
