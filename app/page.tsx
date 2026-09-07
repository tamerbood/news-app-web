import type { Metadata } from 'next';
import HomeClient from './HomeClient';

type Article = {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: { name: string };
  category?: { name: string };
};

type ArticlesResponse = {
  items?: Article[];
  totalPages?: number;
};

type Story = {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType?: string;
  actionUrl?: string | null;
  sourceId?: string | null;
  isActive: boolean;
  sortOrder?: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  sourceName?: string | null;
  sourceLogoUrl?: string | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export const metadata: Metadata = {
  title: 'أخبار العالم لحظة بلحظة',
  description: 'أحدث أخبار العالم والعرب والرياضة والتكنولوجيا والاقتصاد من مصادر متعددة في تجربة عربية حديثة وسريعة.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'مدى العالم | أخبار العالم لحظة بلحظة',
    description: 'أحدث الأخبار من مصادر متعددة في تجربة عربية حديثة وسريعة.',
    siteName: 'مدى العالم',
    locale: 'ar_AR',
  },
  twitter: {
    card: 'summary',
    title: 'مدى العالم | أخبار العالم لحظة بلحظة',
    description: 'أحدث الأخبار من مصادر متعددة في تجربة عربية حديثة وسريعة.',
  },
};

async function getInitialArticles(): Promise<ArticlesResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) return {};

  try {
    const response = await fetch(`${apiUrl}/articles?page=1&limit=20`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return {};
    const data = await response.json();
    if (!data || typeof data !== 'object') return {};

    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items = Array.from(
      new Map<string, Article>(
        rawItems
          .filter((item: Article) => item?.id)
          .map((item: Article) => [item.id, item]),
      ).values(),
    );

    return {
      items,
      totalPages: Number.isFinite(data.totalPages) ? data.totalPages : 1,
    };
  } catch {
    return {};
  }
}

async function getInitialStories(): Promise<Story[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/stories`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    return items.filter(
      (story: Story) =>
        story &&
        story.isActive !== false &&
        typeof story.mediaUrl === 'string' &&
        story.mediaUrl.trim(),
    );
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [initialArticles, initialStories] = await Promise.all([
    getInitialArticles(),
    getInitialStories(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${normalizedSiteUrl}/#organization`,
        name: 'مدى العالم',
        alternateName: ['MADA ALALAM', 'madaalalam.com'],
        url: normalizedSiteUrl,
        logo: `${normalizedSiteUrl}/favicon.ico`,
        description: 'مدى العالم منصة أخبار عربية تجمع أحدث الأخبار من مصادر متعددة في مكان واحد.',
        email: 'contact@madaalalam.com',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@madaalalam.com',
          contactType: 'customer support',
          availableLanguage: ['ar', 'en'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${normalizedSiteUrl}/#website`,
        name: 'مدى العالم',
        alternateName: ['MADA ALALAM', 'madaalalam.com'],
        url: `${normalizedSiteUrl}/`,
        inLanguage: 'ar',
        publisher: { '@id': `${normalizedSiteUrl}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${normalizedSiteUrl}/#webpage`,
        url: `${normalizedSiteUrl}/`,
        name: 'مدى العالم | أخبار العالم لحظة بلحظة',
        description: 'أحدث أخبار العالم والعرب والرياضة والتكنولوجيا والاقتصاد من مصادر متعددة في تجربة عربية حديثة وسريعة.',
        isPartOf: { '@id': `${normalizedSiteUrl}/#website` },
        about: { '@id': `${normalizedSiteUrl}/#organization` },
        inLanguage: 'ar',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <HomeClient
        initialArticles={initialArticles.items ?? []}
        initialTotalPages={initialArticles.totalPages ?? 1}
        initialStories={initialStories}
      />
    </>
  );
}
