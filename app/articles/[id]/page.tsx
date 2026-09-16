import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleClient, { type Article } from './ArticleClient';

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
    return data && typeof data === 'object' ? (data as Article) : null;
  } catch {
    return null;
  }
}

function articleDescription(article: Article) {
  return (
    article.description?.trim() ||
    `اقرأ تفاصيل خبر ${article.title} عبر مدى العالم، منصة الأخبار التي تجمع الأخبار من مصادر متعددة.`
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

  const title = article.title.trim();
  const description = articleDescription(article);
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

  const canonical = `${siteUrl.replace(/\/$/, '')}/articles/${encodeURIComponent(article.id)}`;
  const description = articleDescription(article);
  const jsonLd = {
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
    author: {
      '@type': 'Organization',
      name: article.source?.name || 'مدى العالم',
      ...(article.source?.websiteUrl ? { url: article.source.websiteUrl } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'مدى العالم',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl.replace(/\/$/, '')}/icons/icon-512.png`,
      },
    },
  };

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: `${siteUrl.replace(/\/$/, '')}/`,
    },
    ...(article.category?.name
      ? [{
          '@type': 'ListItem',
          position: 2,
          name: article.category.name,
          item: `${siteUrl.replace(/\/$/, '')}/categories?category=${encodeURIComponent(article.category.name)}`,
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
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ArticleClient initialArticle={article} />
    </>
  );
}
