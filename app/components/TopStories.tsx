import Link from 'next/link';
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
  if (!articles.length) return null;

  const ordered = [...articles].sort((a, b) => {
    const score = (x: Article) => (x.isPinned ? 4 : 0) + (x.isFeatured ? 2 : 0);
    return score(b) - score(a);
  });
  const lead = ordered[0];
  const secondary = ordered.slice(1, 4);
  const side = ordered.slice(4, 6);

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
        <Link href={`/articles/${lead.id}`} className="mada-hero-news">
          <div className="mada-hero-news-image">
            {lead.imageUrl ? <img src={optimizeImageUrl(lead.imageUrl, 1100)} alt="" width="1100" height="620" fetchPriority="high" loading="eager" sizes="(max-width: 800px) 100vw, 66vw" /> : <div className="mada-image-placeholder">MADA</div>}
            <div className="mada-hero-overlay" />
            <span className="mada-hero-live">الأبرز</span>
            <div className="mada-hero-copy">
              <div className="mada-hero-meta"><span>{lead.category?.name || 'أخبار'}</span><i /> <span>{lead.source?.name || 'مصدر إخباري'}</span><i /> <span>{formatRelative(lead.publishedAt)}</span></div>
              <h3>{lead.title}</h3>
              {summary(lead.description, 175) && <p>{summary(lead.description, 175)}</p>}
              <span className="mada-hero-read">فتح الخبر <b>←</b></span>
            </div>
          </div>
        </Link>

        <div className="mada-news-side-column">
          {secondary.map((article, index) => (
            <Link href={`/articles/${article.id}`} key={article.id} className="mada-news-side-item">
              <span className="mada-news-side-number">0{index + 2}</span>
              <div className="mada-news-side-image">
                {article.imageUrl ? <img src={optimizeImageUrl(article.imageUrl, 360)} alt="" width="360" height="220" loading="lazy" sizes="180px" /> : <span>M</span>}
              </div>
              <div className="mada-news-side-copy">
                <div><span>{article.category?.name || 'أخبار'}</span><i /><span>{formatRelative(article.publishedAt)}</span></div>
                <h3>{article.title}</h3>
                <small>{article.source?.name || 'مصدر إخباري'}</small>
              </div>
            </Link>
          ))}
          {side.length > 0 && (
            <div className="mada-news-mini-row">
              {side.map((article) => (
                <Link href={`/articles/${article.id}`} key={article.id}>
                  <span>{article.category?.name || 'خبر'}</span>
                  <strong>{article.title}</strong>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
