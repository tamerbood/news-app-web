import FavoriteButton from './FavoriteButton';
import ArticleLink from './ArticleLink';
import { optimizeImageUrl } from '../lib/optimized-image-url';

type Article = {
  id: string; title: string; isOriginal?: boolean; url?: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

export default function NewsCard({ article }: { article: Article }) {
  const image = article.imageUrl?.trim() || `${process.env.NEXT_PUBLIC_API_URL}/assets/images/news-placeholder.png`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ar-JO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Amman' })
    : '';

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
        <h3><ArticleLink article={article} className="mada-news-title-link">{article.title}</ArticleLink></h3>
        <div className="mada-news-footer">
          <span className="mada-news-date">{article.source?.name ?? 'مدى العالم'}</span>
          <div className="flex gap-2">
            <FavoriteButton id={article.id} />
            <ArticleLink article={article} className="mada-btn mada-btn-primary">
              {article.isOriginal ? 'قراءة الخبر' : 'المصدر الأصلي ↗'}
            </ArticleLink>
          </div>
        </div>
      </div>
    </article>
  );
}
