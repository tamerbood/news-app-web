import Link from 'next/link';
import NewsCard from './NewsCard';
import FavoritesProvider from './FavoritesProvider';
import NewsFeedRefresh from './NewsFeedRefresh';
import Pagination from './Pagination';

type Article = {
  id: string; title: string; description?: string; url: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
};

const LATEST_COUNT = 8;
const MAX_CATEGORY_ITEMS = 4;

export default function NewsFeed({ articles, totalPages, page }: { articles: Article[]; totalPages: number; page: number }) {
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
      <section id="latest">
        <div className="mada-section-head"><div><div className="mada-kicker">Latest</div><h2>آخر الأخبار</h2><p>تصفح الأخبار زمنيًا، من الأحدث إلى الأقدم.</p></div></div>
        {articles.length === 0
          ? <div className="mada-surface mada-empty"><div className="text-3xl mb-3">⌁</div><h3 className="font-black text-xl">لا توجد أخبار</h3><p className="mada-subtitle">لا توجد أخبار متاحة حاليًا.</p></div>
          : <>
            <div className="mada-news-grid">{latestArticles.map(article => <NewsCard key={article.id} article={article} />)}</div>
            <Pagination page={page} totalPages={totalPages} />
          </>}
      </section>

      <div id="category-sections-trigger" aria-hidden="true" className="h-px" />
      {categoryGroups.length > 0 && (
        <section className="mada-category-sections" aria-label="الأخبار حسب الأقسام">
          {categoryGroups.slice(0, 6).map(([category, items]) => (
            <div className="mada-category-block" key={category}>
              <div className="mada-section-head"><div><div className="mada-kicker">Category</div><h2>{category}</h2></div><Link href="/categories" className="mada-category-more">عرض المزيد ←</Link></div>
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
