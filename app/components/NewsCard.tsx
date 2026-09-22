import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import { optimizeImageUrl } from '../lib/optimized-image-url';
import { cleanRssDescription } from '../lib/rss-description';

type Article = {
  id: string; title: string; description?: string; url?: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

export default function NewsCard({ article }: { article: Article }) {
  const image = article.imageUrl?.trim() || `${process.env.NEXT_PUBLIC_API_URL}/assets/images/news-placeholder.png`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ar-JO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Amman' })
    : '';

  const excerpt = cleanRssDescription(article.description, 180);

  return (
    <article className="mada-news-card">
      <div className="mada-news-media">
        <img
          src={optimizeImageUrl(image, 450)}
          alt=""
          width="450"
          height="253"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 25vw"
        />
        <div className="mada-news-overlay">
          {article.category?.name && <span className="mada-pill">{article.category.name}</span>}
          {article.source?.name && <span className="mada-pill mada-pill-dark">{article.source.name}</span>}
        </div>
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
