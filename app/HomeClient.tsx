import Stories from './components/Stories';
import TopStories from './components/TopStories';
import NewsFeed from './components/NewsFeed';

type Article = { id: string; title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string; source?: { name: string }; category?: { name: string } };
type Story = {
  id: string; title: string; description?: string | null; mediaUrl: string; mediaType?: string;
  actionUrl?: string | null; sourceId?: string | null; isActive: boolean; sortOrder?: number;
  publishedAt?: string | null; expiresAt?: string | null; sourceName?: string | null; sourceLogoUrl?: string | null;
};

export default function HomeClient({
  initialArticles,
  initialTotalPages,
  initialStories,
}: {
  initialArticles: Article[];
  initialTotalPages: number;
  initialStories: Story[];
}) {
  return (
    <main className="mada-page">
      <div className="mada-container">
        <section className="mada-hero">
          <div className="mada-hero-grid">
            <div>
              <div className="mada-kicker mada-hero-kicker">MADA ALALAM</div>
              <h1>مدى العالم — كل الأخبار التي تهمك، في مدى واحد.</h1>
              <p>منصة تجمع الأخبار من مصادر متعددة وتضعها أمامك في تجربة عربية سريعة، واضحة، ومرتبة حسب اهتماماتك.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                <a href="#top-stories" className="mada-btn mada-btn-hero-light">أهم الأخبار الآن ↓</a>
                <a href="/sports" className="mada-btn mada-btn-hero-ghost">آخر الأخبار الرياضية</a>
              </div>
            </div>
          </div>
        </section>

        <TopStories articles={initialArticles.slice(0, 5)} />

        <div className="mada-story-wrap">
          <Stories initialStories={initialStories} />
        </div>

        <NewsFeed initialArticles={initialArticles} initialTotalPages={initialTotalPages} />
      </div>
    </main>
  );
}
