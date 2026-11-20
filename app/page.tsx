import type { Metadata } from 'next';
import HomeClient from './HomeClient';

type Article = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: { name: string };
};

type Story = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType?: string;
  actionUrl?: string | null;
  isActive?: boolean;
  sourceName?: string | null;
  sourceLogoUrl?: string | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';

export async function generateMetadata(): Promise<Metadata> {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const canonical = normalizedSiteUrl;
  const title = 'مدى العالم | تقارير ومواد تحريرية أصلية';

  return {
    title: { absolute: title },
    description: 'تقارير ومواد صحفية أصلية من إعداد هيئة تحرير مدى العالم، مع توثيق المصادر والتصحيحات.',
    alternates: { canonical },
    // Keep the home page out of search until it has a substantial body of
    // first-party editorial work to index.
    robots: { index: false, follow: true },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description: 'تقارير ومواد صحفية أصلية من إعداد هيئة تحرير مدى العالم.',
      siteName: 'مدى العالم',
      locale: 'ar_AR',
      images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: ['/icons/icon-512.png'],
      description: 'تقارير ومواد صحفية أصلية من إعداد هيئة تحرير مدى العالم.',
    },
  };
}

async function getOriginalArticles(limit = 6): Promise<Article[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) return [];
  try {
    const response = await fetch(`${apiUrl}/articles/original?page=1&limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.items)
      ? data.items.filter((item: Article & { isOriginal?: boolean }) => item?.isOriginal === true)
      : [];
  } catch { return []; }
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
    ).map((story: Story) => ({
      id: story.id,
      title: story.title,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      actionUrl: story.actionUrl,
      sourceName: story.sourceName,
      sourceLogoUrl: story.sourceLogoUrl,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [initialStories, originalArticles] = await Promise.all([
    getInitialStories(),
    getOriginalArticles(6),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const canonical = normalizedSiteUrl;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${normalizedSiteUrl}/#organization`,
        name: 'مدى العالم',
        alternateName: 'MADA ALALAM',
        url: normalizedSiteUrl,
        logo: `${normalizedSiteUrl}/icons/icon-512.png`,
        description: 'مدى العالم ينشر تقارير ومواد تحريرية أصلية مع توثيق المصادر.',
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
        alternateName: 'MADA ALALAM',
        url: `${normalizedSiteUrl}/`,
        inLanguage: 'ar',
        publisher: { '@id': `${normalizedSiteUrl}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}/#webpage`,
        url: canonical,
        name: 'مدى العالم | تقارير ومواد تحريرية أصلية',
        description: 'تقارير ومواد صحفية أصلية من إعداد هيئة تحرير مدى العالم.',
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
        initialStories={initialStories}
        originalArticles={originalArticles}
      />
    </>
  );
}
