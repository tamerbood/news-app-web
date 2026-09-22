import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleClient, { type Article } from './ArticleClient';
import { cleanRssDescription } from '../../lib/rss-description';

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
      : { ...article, description: cleanRssDescription(article.description) };
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
        : { ...item, description: cleanRssDescription(item.description) })
      .slice(0, 8);
  } catch {
    return [];
  }
}

function articleDescription(article: Article) {
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

  const title = (article.seoTitle?.trim() || article.title.trim());
  const description = (article.seoDescription?.trim() || articleDescription(article));
  const canonical = `${siteUrl.replace(/\/$/, '')}/articles/${encodeURIComponent(article.id)}`;
  const isOriginal = article.isOriginal === true;

  return {
    title,
    description,
    alternates: { canonical },
    // Only editorial/original articles are eligible for search indexing.
    // Syndicated RSS items remain usable inside the app but are deliberately
    // excluded from Google indexing until they contain original editorial value.
    robots: isOriginal
      ? { index: true, follow: true }
      : { index: false, follow: true },
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
      authors: article.source?.name ? [article.source.name] : ['مدى العالم'],
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

  const relatedArticles = await getRelatedArticles(article);

  const baseUrl = siteUrl.replace(/\/$/, '');
  const canonical = `${baseUrl}/articles/${encodeURIComponent(article.id)}`;
  const description = articleDescription(article);
  const isOriginal = article.isOriginal === true;

  const structuredData = isOriginal
    ? {
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
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: article.title,
        description,
        url: canonical,
        isPartOf: {
          '@type': 'WebSite',
          name: 'مدى العالم',
          url: baseUrl,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
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
