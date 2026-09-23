import Link from 'next/link';
import { optimizeImageUrl } from '../lib/optimized-image-url';
import { cleanRssDescription } from '../lib/rss-description';
import SafeImage from './SafeImage';
import styles from './TopStories.module.css';

type Article = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: { name: string };
  category?: { name: string };
};

function formatDate(value?: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('ar', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Amman',
    }).format(new Date(value));
  } catch { return ''; }
}

export default function TopStories({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const leadArticle = articles[0];
  // Four side stories. The hero height is matched to the complete four-card rail.
  const sideArticles = articles.slice(1, 5);
  const leadExcerpt = cleanRssDescription(leadArticle.description, 220);
  const showExcerpt = Boolean(leadExcerpt && leadExcerpt.trim() !== leadArticle.title.trim());

  return (
    <section id="top-stories" className={styles.section} aria-labelledby="top-stories-title">
      <div className="mada-section-head">
        <div>
          <div className="mada-kicker">واجهة الأخبار</div>
          <h2 id="top-stories-title">المشهد الآن</h2>
          <p>أهم القصص والتطورات في واجهة صحفية واحدة.</p>
        </div>
      </div>

      <div className={styles.grid} dir="rtl">
        <Link href={`/articles/${leadArticle.id}`} className={styles.lead}>
          <div className={styles.leadMedia}>
            <SafeImage
              src={leadArticle.imageUrl ? optimizeImageUrl(leadArticle.imageUrl, 1200) : undefined}
              alt={leadArticle.title}
              fill
              fetchPriority="high"
              loading="eager"
              decoding="async"
              sizes="(max-width: 1023px) 100vw, 58vw"
              className={styles.leadImage}
            />
            <div className={styles.leadShade} aria-hidden="true" />
            <span className={styles.leadBadge}>{leadArticle.category?.name || 'أخبار'}</span>
          </div>
          <div className={styles.leadCopy}>
            <div className={styles.meta}>
              {leadArticle.source?.name || 'مصدر إخباري'}
              {formatDate(leadArticle.publishedAt) ? ` • ${formatDate(leadArticle.publishedAt)}` : ''}
            </div>
            <h3 className={styles.leadTitle}>{leadArticle.title}</h3>
            {showExcerpt && <p className={styles.excerpt}>{leadExcerpt}</p>}
          </div>
        </Link>

        <div className={styles.rail}>
          {sideArticles.map((article) => (
            <Link href={`/articles/${article.id}`} key={article.id} className={styles.sideCard}>
              <div className={styles.thumb}>
                <SafeImage
                  src={article.imageUrl ? optimizeImageUrl(article.imageUrl, 360) : undefined}
                  alt={article.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="128px"
                  className={styles.thumbImage}
                />
              </div>
              <div className={styles.sideCopy}>
                <span className={styles.category}>{article.category?.name || 'أخبار'}</span>
                <h3 className={styles.sideTitle}>{article.title}</h3>
                <p className={styles.sideMeta}>
                  {article.source?.name || 'مصدر إخباري'}
                  {formatDate(article.publishedAt) ? ` • ${formatDate(article.publishedAt)}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
