import Link from 'next/link';
import NewsCard from './NewsCard';
import FavoritesProvider from './FavoritesProvider';
import NewsFeedRefresh from './NewsFeedRefresh';
import Pagination from './Pagination';

type Article = {
  id: string; title: string; description?: string; url: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

const LATEST_COUNT = 9;
const MAX_CATEGORY_ITEMS = 4;

const CATEGORY_LABELS: Record<string, string> = {
  World: 'العالم', Sports: 'رياضة', Technology: 'تكنولوجيا', Business: 'اقتصاد',
  Entertainment: 'منوعات', Cars: 'سيارات',
};

function displayCategory(name: string) {
  return CATEGORY_LABELS[name] ?? name;
}

export default function NewsFeed({
  articles,
  totalPages,
  page,
  countryCode,
  countryLabel,
}: {
  articles: Article[];
  totalPages: number;
  page: number;
  countryCode: string;
  countryLabel: string;
}) {
  const latestArticles = articles.slice(5, 5 + LATEST_COUNT);
  const categorySourceArticles = articles.slice(5 + LATEST_COUNT);
  const categoryGroups = Array.from(categorySourceArticles.reduce((groups, article) => {
    const name = article.category?.name?.trim() || 'منوعات';
    const current = groups.get(name) ?? [];
    if (current.length < MAX_CATEGORY_ITEMS) current.push(article);
    groups.set(name, current);
    return groups;
  }, new Map<string, Article[]>()).entries());

  return (
    <FavoritesProvider>
      <NewsFeedRefresh />

      <section id="latest" className="mada-latest-section" aria-labelledby="latest-title">
        <div className="mada-section-head mada-editorial-head">
          <div>
            <div className="mada-section-mark"><span /> آخر الأخبار</div>
            <h2 id="latest-title">الأحدث من غرفة الأخبار</h2>
            <p>الأخبار مرتبة زمنيًا، من الأحدث إلى الأقدم.</p>
          </div>
          <div className="mada-section-context">أخبار {countryLabel}{countryCode !== 'NONE' ? ' · مخصصة لك' : ''}</div>
        </div>

        {articles.length === 0 ? (
          <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار</h3><p className="mada-subtitle">لا توجد أخبار متاحة حاليًا.</p></div>
        ) : <>
          <div className="mada-news-grid">{latestArticles.map(article => <NewsCard key={article.id} article={article} />)}</div>
          <Pagination page={page} totalPages={totalPages} />
        </>}
      </section>

      {categoryGroups.length > 0 && (
        <section className="mada-category-sections" aria-label="الأخبار حسب الأقسام">
          {categoryGroups.slice(0, 4).map(([category, items]) => (
            <div className="mada-category-block" key={category}>
              <div className="mada-section-head mada-editorial-head">
                <div>
                  <div className="mada-section-mark"><span /> قسم</div>
                  <h2>{displayCategory(category)}</h2>
                </div>
                <Link href={`/categories?category=${encodeURIComponent(category)}`} className="mada-category-more">عرض القسم <span aria-hidden="true">←</span></Link>
              </div>
              <div className="mada-category-grid">
                {items.map(article => <NewsCard key={`${category}-${article.id}`} article={article} />)}
              </div>
            </div>
          ))}
        </section>
      )}
    </FavoritesProvider>
  );
}
