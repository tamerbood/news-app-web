import { optimizeImageUrl } from '../lib/optimized-image-url';
import Link from 'next/link';

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
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function shortDescription(value?: string) {
  const text = value?.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > 145 ? `${text.slice(0, 145).trim()}…` : text;
}

export default function TopStories({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const ordered = [...articles].sort((a, b) => {
    const score = (article: Article) => (article.isPinned ? 3 : 0) + (article.isFeatured ? 2 : 0);
    return score(b) - score(a);
  });
  const leadArticle = ordered[0];
  const supportingArticles = ordered.slice(1, 5);

  return (
    <section id="top-stories" className="mada-top-stories" aria-labelledby="top-stories-title">
      <div className="mada-section-head mada-editorial-head">
        <div>
          <div className="mada-section-mark"><span /> أهم الأخبار</div>
          <h2 id="top-stories-title">أهم ما يجري الآن</h2>
          <p>مختارات تحريرية من أحدث الأخبار التي تستحق الانتباه.</p>
        </div>
        <Link href="#latest" className="mada-section-more">استكشف آخر الأخبار <span aria-hidden="true">←</span></Link>
      </div>

      <div className="mada-top-stories-grid">
        <Link href={`/articles/${leadArticle.id}`} className="mada-lead-story">
          <div className="mada-lead-story-media">
            {leadArticle.imageUrl ? (
              <img
                src={optimizeImageUrl(leadArticle.imageUrl, 960)}
                alt=""
                width="960"
                height="540"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sizes="(max-width: 900px) 100vw, 68vw"
              />
            ) : <div className="mada-lead-story-placeholder">MADA</div>}
            <span className="mada-lead-story-label">رئيسي</span>
          </div>
          <div className="mada-lead-story-body">
            <div className="mada-story-meta">
              <span>{leadArticle.source?.name || 'مصدر إخباري'}</span>
              {leadArticle.category?.name && <><i /> <span>{leadArticle.category.name}</span></>}
              {formatRelative(leadArticle.publishedAt) && <><i /> <span>{formatRelative(leadArticle.publishedAt)}</span></>}
            </div>
            <h3>{leadArticle.title}</h3>
            {shortDescription(leadArticle.description) && <p>{shortDescription(leadArticle.description)}</p>}
            <span className="mada-read-link">اقرأ الخبر <span aria-hidden="true">←</span></span>
          </div>
        </Link>

        <div className="mada-supporting-stories" aria-label="أخبار مهمة">
          {supportingArticles.map((article, index) => (
            <Link href={`/articles/${article.id}`} key={article.id} className="mada-supporting-story">
              <div className="mada-supporting-story-copy">
                <div className="mada-supporting-story-meta">
                  <span>{article.category?.name || 'أخبار'}</span>
                  {formatRelative(article.publishedAt) && <><i /> <span>{formatRelative(article.publishedAt)}</span></>}
                </div>
                <h3>{article.title}</h3>
                <p>{article.source?.name || 'مصدر إخباري'}</p>
              </div>
              <div className="mada-supporting-story-media">
                {article.imageUrl ? (
                  <img src={optimizeImageUrl(article.imageUrl, 320)} alt="" width="320" height="190" loading="lazy" decoding="async" sizes="140px" />
                ) : <div className="mada-story-placeholder">M</div>}
              </div>
              <span className="mada-supporting-index" aria-hidden="true">0{index + 2}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
