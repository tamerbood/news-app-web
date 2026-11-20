import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ArticleClient, { type Article } from './ArticleClient';
import { safeExternalUrl } from '../../lib/external-url';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function getArticle(id: string): Promise<Article | null> {
  if (!apiUrl) return null;

  try {
    const response = await fetch(
      `${apiUrl}/articles/${encodeURIComponent(id)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return null;

    const data = await response.json();
    if (!data || typeof data !== 'object') return null;
    const article = data as Article;
    return article.isOriginal === true
      ? article
      : {
          id: article.id,
          title: article.title,
          url: article.url,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          isOriginal: false,
          source: article.source,
          category: article.category,
        };
  } catch {
    return null;
  }
}


async function getRelatedArticles(article: Article): Promise<Article[]> {
  if (!apiUrl) return [];

  try {
    const categoryQuery = article.category?.id
      ? `&categoryId=${encodeURIComponent(article.category.id)}`
      : '';
    const response = await fetch(
      `${apiUrl}/articles?page=1&limit=12${categoryQuery}`,
      { cache: 'no-store' },
    );

    if (!response.ok) return [];
    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    return items
      .filter((item: Article) => item?.id && item.id !== article.id)
      .map((item: Article) => item.isOriginal === true
        ? item
        : {
            id: item.id,
            title: item.title,
            url: item.url,
            imageUrl: item.imageUrl,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            isOriginal: false,
            source: item.source,
            category: item.category,
          })
      .slice(0, 8);
  } catch {
    return [];
  }
}

function articleDescription(article: Article) {
  if (article.isOriginal !== true) {
    return article.source?.name
      ? `اقرأ تفاصيل الخبر لدى ${article.source.name}.`
      : 'اقرأ تفاصيل الخبر لدى المصدر الإخباري الأصلي.';
  }

  return (
    article.description?.trim() ||
    `تفاصيل الخبر من المصدر الأصلي عبر مدى العالم: ${article.title}`
  ).slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: 'الخبر غير موجود',
      description: 'الخبر المطلوب غير متاح حاليًا.',
      robots: { index: false, follow: false },
    };
  }

  if (article.isOriginal !== true) {
    return {
      title: 'الخبر غير متاح',
      robots: { index: false, follow: false },
    };
  }

  const title = article.seoTitle?.trim() || article.title.trim();
  const description = article.seoDescription?.trim() || articleDescription(article);
  const canonical = `${siteUrl.replace(/\/$/, '')}/articles/${encodeURIComponent(article.id)}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: 'مدى العالم',
      locale: 'ar_AR',
      ...(article.imageUrl ? { images: [{ url: article.imageUrl, alt: title }] } : {}),
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: ['هيئة تحرير مدى العالم'],
      section: article.category?.name,
    },
    twitter: {
      card: article.imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(article.imageUrl ? { images: [article.imageUrl] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  if (article.isOriginal !== true) {
    const sourceUrl = safeExternalUrl(article.url);
    if (sourceUrl) permanentRedirect(sourceUrl);
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);

  const baseUrl = siteUrl.replace(/\/$/, '');
  const canonical = `${baseUrl}/articles/${encodeURIComponent(article.id)}`;
  const description = articleDescription(article);
  const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description,
        url: canonical,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        image: article.imageUrl ? [article.imageUrl] : undefined,
        articleSection: article.category?.name,
        publisher: {
          '@type': 'Organization',
          name: 'مدى العالم',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/icons/icon-512.png`,
          },
        },
        author: {
          '@type': 'Organization',
          name: 'هيئة تحرير مدى العالم',
          url: `${baseUrl}/editorial-policy`,
        },
        citation: (article.originalMeta?.sources ?? []).flatMap((source) => {
          const sourceUrl = safeExternalUrl(source?.url);
          return sourceUrl
            ? [{
                '@type': 'CreativeWork',
                name: source.title || source.source || 'مصدر الخبر',
                url: sourceUrl,
              }]
            : [];
        }),
      };

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: `${baseUrl}/`,
    },
    ...(article.category?.name
      ? [{
          '@type': 'ListItem',
          position: 2,
          name: article.category.name,
          item: `${baseUrl}/categories?category=${encodeURIComponent(article.category.name)}`,
        }]
      : []),
    {
      '@type': 'ListItem',
      position: article.category?.name ? 3 : 2,
      name: article.title,
      item: canonical,
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ArticleClient initialArticle={article} relatedArticles={relatedArticles} />
    </>
  );
}
