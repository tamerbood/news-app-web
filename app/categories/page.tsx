import type { Metadata } from 'next';
import Link from 'next/link';
import { getUserCountryCode } from '../lib/user-country';

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
  category?: { id?: string; name?: string } | null;
}

interface ArticlesResponse {
  items?: Article[];
  articles?: Article[];
}

const categoryLabels: Record<string, string> = {
  World: 'مصادر عالمية',
  Sports: 'رياضة',
  Technology: 'تكنولوجيا',
  Business: 'اقتصاد',
  Entertainment: 'منوعات',
  Cars: 'سيارات',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

function getCategoryLabel(name: string): string {
  return categoryLabels[name] ?? name;
}

async function getCategories(): Promise<Category[]> {
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const loaded = Array.isArray(data)
      ? data
      : data?.categories ?? data?.value ?? data?.data ?? [];

    if (!Array.isArray(loaded)) return [];

    // Use the real categories returned by the API, including Arabic names.
    // A hard-coded English allow-list would hide valid categories from the public page.
    return loaded.filter(
      (category: Category) => Boolean(category?.id && category?.name),
    );
  } catch {
    return [];
  }
}

async function getArticles(categoryId?: string, countryCode = 'NONE'): Promise<Article[]> {
  if (!apiUrl) return [];

  try {
    const response = await fetch(
      `${apiUrl}/articles?${categoryId ? `categoryId=${encodeURIComponent(categoryId)}&` : ''}page=1&limit=24&countryCode=${encodeURIComponent(countryCode)}`,
      {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) return [];

    const data = (await response.json()) as ArticlesResponse | Article[];
    const items = Array.isArray(data)
      ? data
      : data.items ?? data.articles ?? [];

    return items.filter((article) => article?.id && article?.title);
  } catch {
    return [];
  }
}

function categoryUrl(name: string): string {
  return `/categories?category=${encodeURIComponent(name)}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const categories = await getCategories();
  const category = categories.find(
    (item) => item.name.toLowerCase() === (rawCategory ?? '').toLowerCase(),
  );

  if (!category) {
    return {
      title: 'تصنيفات الأخبار',
      description: 'تصفح الأخبار حسب التصنيف في مدى العالم.',
      alternates: { canonical: `${siteUrl.replace(/\/$/, '')}/categories` },
      robots: { index: true, follow: true },
      openGraph: {
        type: 'website',
        url: `${siteUrl.replace(/\/$/, '')}/categories`,
        title: 'تصنيفات الأخبار',
        description: 'تصفح الأخبار حسب التصنيف في مدى العالم.',
        siteName: 'مدى العالم',
        locale: 'ar_AR',
        images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'تصنيفات الأخبار',
        description: 'تصفح الأخبار حسب التصنيف في مدى العالم.',
        images: ['/icons/icon-512.png'],
      },
    };
  }

  const label = getCategoryLabel(category.name);
  const canonical = `${siteUrl.replace(/\/$/, '')}${categoryUrl(category.name)}`;

  return {
    title: `${label} | أخبار مدى العالم`,
    description: `أحدث أخبار ${label} من مدى العالم، مرتبة حسب التصنيف ومحدثة باستمرار.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${label} | أخبار مدى العالم`,
      description: `أحدث أخبار ${label} من مدى العالم.`,
      siteName: 'مدى العالم',
      locale: 'ar_AR',
      images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} | أخبار مدى العالم`,
      description: `أحدث أخبار ${label} من مدى العالم.`,
      images: ['/icons/icon-512.png'],
    },
  };
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const categories = await getCategories();
  const countryCode = await getUserCountryCode();
  const selectedCategory = categories.find(
    (category) => category.name.toLowerCase() === (rawCategory ?? '').toLowerCase(),
  );
  const articles = await getArticles(selectedCategory?.id, countryCode);
  const selectedLabel = selectedCategory ? getCategoryLabel(selectedCategory.name) : '';

  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCategory ? `أخبار ${selectedLabel}` : 'أقسام الأخبار'}
          </h1>
          <p className="mt-2 text-gray-500">
            {selectedCategory
              ? `أحدث الأخبار في قسم ${selectedLabel} من مدى العالم.`
              : 'تصفح أحدث الأخبار حسب القسم.'}
          </p>
        </header>

        <nav aria-label="تصنيفات الأخبار" className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">الأقسام</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/categories"
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                !selectedCategory ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              الكل
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryUrl(category.name)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  selectedCategory?.id === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category.name)}
              </Link>
            ))}
          </div>
        </nav>

        <section className="mt-8" aria-labelledby="category-articles-heading">
            <h2 id="category-articles-heading" className="mb-5 text-2xl font-bold text-gray-900">
              {selectedCategory ? `أحدث أخبار ${selectedLabel}` : 'أحدث الأخبار'}
            </h2>

            {articles.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">لا توجد أخبار في هذا القسم حاليًا.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, index) => (
                  <article key={article.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        width={600}
                        height={338}
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="h-52 w-full object-cover"
                      />
                    )}
                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {article.source?.name && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            {article.source.name}
                          </span>
                        )}
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          {selectedLabel}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-8 text-gray-900">
                        <Link href={`/articles/${encodeURIComponent(article.id)}`} className="hover:underline">
                          {article.title}
                        </Link>
                      </h3>
                      {article.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between gap-4">
                        {article.publishedAt ? (
                          <time dateTime={article.publishedAt} className="text-xs text-gray-500">
                            {new Date(article.publishedAt).toLocaleDateString('ar-JO')}
                          </time>
                        ) : <span />}
                        <Link
                          href={`/articles/${encodeURIComponent(article.id)}`}
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          قراءة الخبر
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
      </section>
    </main>
  );
}
