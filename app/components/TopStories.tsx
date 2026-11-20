import { optimizeImageUrl } from '../lib/optimized-image-url';
import ArticleLink from './ArticleLink';

type Article = {
  id: string;
  title: string;
  isOriginal?: boolean;
  url?: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: { name: string };
  category?: { name: string };
};

export default function TopStories({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const leadArticle = articles[0];
  const supportingArticles = articles.slice(1, 5);
  function formatDate(value?: string) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('ar', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Amman',
      }).format(new Date(value));
    } catch {
      return '';
    }
  }

  return (
    <section id="top-stories" className="mada-top-stories" aria-labelledby="top-stories-title">
      <div className="mada-section-head">
        <div>
          <div className="mada-kicker">Top Stories</div>
          <h2 id="top-stories-title">أهم الأخبار الآن</h2>
          <p>أبرز ما يستحق انتباهك من آخر الأخبار الواردة.</p>
        </div>
      </div>

      <div className="mada-top-stories-grid">
        <ArticleLink article={leadArticle} className="mada-lead-story">
          <div className="mada-lead-story-media">
            {leadArticle.imageUrl ? (
              <img
                src={optimizeImageUrl(leadArticle.imageUrl, 450)}
                alt=""
                width="450"
                height="253"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sizes="(max-width: 900px) 100vw, 62vw"
              />
            ) : (
              <div className="mada-lead-story-placeholder">MADA</div>
            )}
            <span className="mada-story-category">{leadArticle.category?.name || 'أخبار'}</span>
          </div>
          <div className="mada-lead-story-body">
            <div className="mada-story-meta">
              {leadArticle.source?.name || 'مصدر إخباري'}
              {formatDate(leadArticle.publishedAt) ? ` • ${formatDate(leadArticle.publishedAt)}` : ''}
            </div>
            <h3>{leadArticle.title}</h3>
          </div>
        </ArticleLink>

        <div className="mada-supporting-stories">
          {supportingArticles.map((article) => (
            <ArticleLink article={article} key={article.id} className="mada-supporting-story">
              <div className="mada-supporting-story-media">
                {article.imageUrl ? (
                  <img
                    src={optimizeImageUrl(article.imageUrl, 160)}
                    alt=""
                    width="112"
                    height="88"
                    loading="lazy"
                    decoding="async"
                    sizes="112px"
                  />
                ) : (
                  <div className="mada-story-placeholder">M</div>
                )}
              </div>
              <div className="mada-supporting-story-body">
                <span>{article.category?.name || 'أخبار'}</span>
                <h3>{article.title}</h3>
                <p>
                  {article.source?.name || 'مصدر إخباري'}
                  {formatDate(article.publishedAt) ? ` • ${formatDate(article.publishedAt)}` : ''}
                </p>
              </div>
            </ArticleLink>
          ))}
        </div>
      </div>
    </section>
  );
}
