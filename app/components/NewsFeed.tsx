import Link from 'next/link';
import NewsCard from './NewsCard';
import FavoritesProvider from './FavoritesProvider';
import NewsFeedRefresh from './NewsFeedRefresh';
import PopularTopics from './PopularTopics';
import Pagination from './Pagination';

type Article = {
  id: string; title: string; description?: string; url: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

const LATEST_COUNT = 9;
const CATEGORY_LABELS: Record<string, string> = {
  World: 'العالم', Sports: 'رياضة', Technology: 'تكنولوجيا', Business: 'اقتصاد',
  Entertainment: 'منوعات', Cars: 'سيارات',
};

function displayCategory(name: string) { return CATEGORY_LABELS[name] ?? name; }

export default function NewsFeed({ articles, totalPages, page, countryCode, countryLabel, popularArticles = [] }: {
  articles: Article[]; totalPages: number; page: number; countryCode: string; countryLabel: string; popularArticles?: Article[];
}) {
  const latest = articles.slice(0, LATEST_COUNT);
  const categoryGroups = Array.from(articles.slice(LATEST_COUNT).reduce((groups, article) => {
    const name = article.category?.name?.trim() || 'منوعات';
    const current = groups.get(name) ?? [];
    if (current.length < 4) current.push(article);
    groups.set(name, current);
    return groups;
  }, new Map<string, Article[]>()).entries());

  return (
    <FavoritesProvider>
      <NewsFeedRefresh />
      <section id="latest" className="mada-latest-section" aria-labelledby="latest-title">
        <div className="mada-editorial-section-head mada-latest-head">
          <div>
            <span className="mada-section-eyebrow">LIVE FEED · UPDATED CONTINUOUSLY</span>
            <h2 id="latest-title">آخر الأخبار</h2>
          </div>
          <div className="mada-latest-context"><span className="mada-pulse-dot" /> أخبار {countryLabel}{countryCode !== 'NONE' ? ' · مخصصة لك' : ''}</div>
        </div>

        {articles.length === 0 ? (
          <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار</h3><p className="mada-subtitle">لا توجد أخبار متاحة حاليًا.</p></div>
        ) : (
          <>
            <div className="mada-latest-editorial-grid">
              {latest.map((article, index) => (
                <NewsCard key={article.id} article={article} variant={index > 2 ? 'compact' : 'standard'} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} />
          </>
        )}
      </section>

      <PopularTopics articles={popularArticles.length ? popularArticles : articles} />

      {categoryGroups.length > 0 && (
        <section className="mada-category-sections" aria-label="الأخبار حسب الأقسام">
          {categoryGroups.slice(0, 4).map(([category, items], index) => (
            <section className={`mada-category-block mada-category-block-${index + 1}`} key={category}>
              <div className="mada-category-heading">
                <div><span className="mada-section-eyebrow">SECTION 0{index + 1}</span><h2>{displayCategory(category)}</h2></div>
                <Link href={`/categories?category=${encodeURIComponent(category)}`} className="mada-category-more">كل أخبار القسم <span>←</span></Link>
              </div>
              <div className="mada-category-editorial-grid">
                {items.map((article, itemIndex) => <NewsCard key={`${category}-${article.id}`} article={article} variant={itemIndex === 0 ? 'standard' : 'compact'} />)}
              </div>
            </section>
          ))}
        </section>
      )}
    </FavoritesProvider>
  );
}
