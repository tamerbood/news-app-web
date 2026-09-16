import Stories from './components/Stories';
import TopStories from './components/TopStories';
import NewsFeed from './components/NewsFeed';

 type Article = {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: { name: string };
  category?: { name: string };
  isFeatured?: boolean;
  isPinned?: boolean;
};

type Story = {
  id: string; title: string; description?: string | null; mediaUrl: string; mediaType?: string;
  actionUrl?: string | null; sourceId?: string | null; isActive: boolean; sortOrder?: number;
  publishedAt?: string | null; expiresAt?: string | null; sourceName?: string | null; sourceLogoUrl?: string | null;
};

const COUNTRY_NAMES: Record<string, string> = {
  JO: 'الأردن', SY: 'سوريا', EG: 'مصر', SA: 'السعودية', AE: 'الإمارات', QA: 'قطر', KW: 'الكويت',
  BH: 'البحرين', OM: 'عُمان', YE: 'اليمن', IQ: 'العراق', LB: 'لبنان', PS: 'فلسطين', LY: 'ليبيا',
  TN: 'تونس', DZ: 'الجزائر', MA: 'المغرب', SD: 'السودان',
};

function countryLabel(code: string) {
  return code === 'NONE' ? 'العالم' : COUNTRY_NAMES[code] ?? 'العالم';
}

export default function HomeClient({
  initialArticles,
  topArticles,
  breakingArticles,
  initialTotalPages,
  initialStories,
  page,
  countryCode,
}: {
  initialArticles: Article[];
  topArticles: Article[];
  breakingArticles: Article[];
  initialTotalPages: number;
  initialStories: Story[];
  page: number;
  countryCode: string;
}) {
  const localLabel = countryLabel(countryCode);
  const hasBreaking = breakingArticles.length > 0;

  return (
    <main className="mada-page mada-home" id="home-content">
      <div className="mada-container">
        {hasBreaking && (
          <section className="mada-breaking-bar" aria-label="الأخبار العاجلة">
            <div className="mada-breaking-label"><span className="mada-live-dot" /> عاجل الآن</div>
            <div className="mada-breaking-window">
              <div className="mada-breaking-track">
                {[...breakingArticles.slice(0, 8), ...breakingArticles.slice(0, 8)].map((article, index) => (
                  <a key={`${article.id}-${index}`} href={`/articles/${article.id}`} className="mada-breaking-item">
                    <span>•</span> {article.title}
                  </a>
                ))}
              </div>
            </div>
            <a href="#latest" className="mada-breaking-link">آخر الأخبار ←</a>
          </section>
        )}

        <TopStories articles={topArticles.slice(0, 6)} countryLabel={localLabel} />

        <div className="mada-story-wrap">
          <Stories initialStories={initialStories} />
        </div>

        <NewsFeed
          articles={initialArticles}
          totalPages={initialTotalPages}
          page={page}
          countryCode={countryCode}
          countryLabel={localLabel}
          popularArticles={topArticles}
        />
      </div>
    </main>
  );
}
