import Stories from './components/Stories';
import TopStories from './components/TopStories';
import NewsFeed from './components/NewsFeed';

type Article = { isOriginal?: boolean; id: string; title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string; source?: { name: string }; category?: { name: string }; viewCount?: number; views?: number };
type Story = {
  id: string; title: string; description?: string | null; mediaUrl: string; mediaType?: string;
  actionUrl?: string | null; sourceId?: string | null; isActive: boolean; sortOrder?: number;
  publishedAt?: string | null; expiresAt?: string | null; sourceName?: string | null; sourceLogoUrl?: string | null;
};

export default function HomeClient({
  initialArticles,
  topArticles,
  initialTotalPages,
  initialStories,
  originalArticles,
  page,
}: {
  initialArticles: Article[];
  topArticles: Article[];
  initialTotalPages: number;
  initialStories: Story[];
  originalArticles: Article[];
  page: number;
}) {
  return (
    <main className="mada-page">
      <div className="mada-container">
        <TopStories articles={topArticles.slice(0, 5)} />

        <div className="mada-story-wrap">
          <Stories initialStories={initialStories} />
        </div>

        {originalArticles.length > 0 && (
          <section className="my-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="mada-original-heading">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><span className="text-xs font-black text-blue-700">خاص مدى العالم</span><h2 id="mada-original-heading" className="mt-1 text-2xl font-black">إنتاج مدى العالم</h2></div>
              <a href="/original" className="text-sm font-bold text-blue-700">عرض الكل ←</a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {originalArticles.map(article => <a key={article.id} href={`/articles/${article.id}`} className="rounded-2xl border border-slate-100 p-4 transition hover:border-blue-200 hover:shadow-sm"><span className="text-[11px] font-black text-blue-700">خاص مدى العالم</span><h3 className="mt-2 font-black leading-7">{article.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{article.description}</p></a>)}
            </div>
          </section>
        )}

        <NewsFeed articles={initialArticles} totalPages={initialTotalPages} page={page} />
      </div>
    </main>
  );
}
