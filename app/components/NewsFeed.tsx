import SafeImage from './SafeImage';
import Link from 'next/link';
import NewsCard from './NewsCard';
import FavoritesProvider from './FavoritesProvider';
import NewsFeedRefresh from './NewsFeedRefresh';
import Pagination from './Pagination';
import PopularTopics from './PopularTopics';
import { optimizeImageUrl } from '../lib/optimized-image-url';

export type Article = {
  id: string; title: string; description?: string; url: string; imageUrl?: string;
  publishedAt?: string; source?: { name: string }; category?: { name: string };
  viewCount?: number; views?: number;
};

const LATEST_COUNT = 8;
const MAX_CATEGORY_ITEMS = 5;

function CompactCard({ article, rank }: { article: Article; rank?: number }) {
  return <Link href={`/articles/${article.id}`} className="mada-compact-card" dir="rtl">
    <div className="mada-compact-media">
      <SafeImage
        src={article.imageUrl ? optimizeImageUrl(article.imageUrl, 240) : undefined}
        alt={article.title}
        fill
        className="object-cover"
        loading="lazy"
        decoding="async"
        sizes="112px"
      />
    </div>
    <div className="mada-compact-copy">
      <div className="mada-compact-meta"><span>{article.category?.name || 'أخبار'}</span>{rank ? <b>{rank}</b> : null}</div>
      <h3>{article.title}</h3>
      <small>{article.source?.name || 'مدى العالم'}</small>
    </div>
  </Link>;
}

function CategoryBlock({ category, items, index }: { category: string; items: Article[]; index: number }) {
  const mode = index % 3;
  return <section className={`mada-category-block mada-category-layout-${mode}`}>
    <div className="mada-section-head"><div><div className="mada-kicker">قسم</div><h2>{category}</h2></div><Link href="/categories" className="mada-category-more">كل أخبار القسم ←</Link></div>
    {mode === 0 ? <div className="mada-category-editorial">
      {items[0] && <NewsCard article={items[0]} variant="feature" />}
      <div className="mada-category-compact-list">{items.slice(1).map(a => <CompactCard key={a.id} article={a} />)}</div>
    </div> : mode === 1 ? <div className="mada-category-scroll">{items.map(a => <NewsCard key={a.id} article={a} variant="compact" />)}</div>
      : <div className="mada-category-text-list">{items.map((a, i) => <CompactCard key={a.id} article={a} rank={i + 1} />)}</div>}
  </section>;
}

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

  return <FavoritesProvider>
    <NewsFeedRefresh />
    <section id="latest" className="mada-latest-section">
      <div className="mada-section-head"><div><div className="mada-kicker">تحديث مستمر</div><h2>آخر الأخبار</h2><p>أحدث ما وصل إلى غرفة أخبار مدى العالم.</p></div></div>
      {articles.length === 0 ? <div className="mada-surface mada-empty"><h3 className="font-black text-xl">لا توجد أخبار</h3><p className="mada-subtitle">لا توجد أخبار متاحة حاليًا.</p></div> : <>
        <div className="mada-latest-editorial">
          {latestArticles[0] && <NewsCard article={latestArticles[0]} variant="feature" />}
          <div className="mada-latest-grid">{latestArticles.slice(1, 5).map(article => <NewsCard key={article.id} article={article} variant="compact" />)}</div>
          <div className="mada-latest-list">{latestArticles.slice(5).map(article => <CompactCard key={article.id} article={article} />)}</div>
        </div>
        <Pagination page={page} totalPages={totalPages} />
      </>}
    </section>

    <PopularTopics articles={articles} />
    <div id="category-sections-trigger" aria-hidden="true" className="h-px" />
    {categoryGroups.length > 0 && <div className="mada-category-sections" aria-label="الأخبار حسب الأقسام">
      {categoryGroups.slice(0, 6).map(([category, items], index) => <CategoryBlock key={category} category={category} items={items} index={index} />)}
    </div>}
  </FavoritesProvider>;
}
