import Link from 'next/link';
import SafeImage from './SafeImage';
import FavoriteButton from './FavoriteButton';
import { optimizeImageUrl } from '../lib/optimized-image-url';
import { cleanRssDescription } from '../lib/rss-description';

type Article = {
  id: string; title: string; description?: string; url?: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

export default function NewsCard({ article, variant = 'standard' }: { article: Article; variant?: 'standard' | 'feature' | 'compact' }) {
  const image = article.imageUrl?.trim();
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ar-JO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Amman' })
    : '';

  const rawExcerpt = cleanRssDescription(article.description, 180);
  const normalizeCopy = (value: string) => value
    .toLocaleLowerCase('ar')
    .replace(/[\s\u200f\u200e]+/g, ' ')
    .replace(/[.!؟?،,:؛;…\-–—]+$/g, '')
    .trim();
  const excerpt = rawExcerpt && normalizeCopy(rawExcerpt) !== normalizeCopy(article.title) ? rawExcerpt : '';

  return (
    <article className={`mada-news-card mada-news-card-${variant}`}>
      <div className="mada-news-media">
        <SafeImage
          src={image ? optimizeImageUrl(image, 900) : undefined}
          alt=""
          fill
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="object-cover"
          sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 25vw"
        />
        {variant !== 'compact' && (article.category?.name || article.source?.name) && (
          <div className="mada-news-overlay">
            <span className="mada-pill mada-pill-dark">{article.category?.name || article.source?.name}</span>
          </div>
        )}
      </div>
      <div className="mada-news-body">
        <div className="mada-news-meta">
          {article.category?.name && <span className="mada-ui-badge mada-ui-badge-info">{article.category.name}</span>}
          {article.publishedAt && <span className="mada-ui-badge mada-ui-badge-neutral">{date}</span>}
        </div>
        <h3><Link href={`/articles/${article.id}`} className="mada-news-title-link">{article.title}</Link></h3>
        {excerpt && <p className="mada-news-description">{excerpt}</p>}
        <div className="mada-news-footer">
          <span className="mada-news-date">{article.source?.name ?? 'مدى العالم'}</span>
          <div className="flex gap-2">
            <FavoriteButton id={article.id} />
            <span className="mada-btn mada-btn-primary" aria-hidden="true">قراءة الخبر</span>
          </div>
        </div>
      </div>
    </article>
  );
}
