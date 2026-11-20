import type { Metadata } from 'next';
import Link from 'next/link';
import { PUBLIC_CATEGORIES, getPublicCategory, matchesPublicCategory } from '../lib/public-categories';

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  category?: { id?: string; name?: string } | null;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

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

async function getOriginalArticles(categoryId?: string): Promise<Article[]> {
  if (!apiUrl) return [];
  try {
    const params = new URLSearchParams({ page: '1', limit: '12' });
    if (categoryId) params.set('categoryId', categoryId);
    const response = await fetch(`${apiUrl}/articles/original?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.items)
      ? data.items.filter((article: Article & { isOriginal?: boolean }) => article?.isOriginal === true)
      : [];
  } catch { return []; }
}

function categoryUrl(key: string): string {
  return `/categories?category=${encodeURIComponent(key)}`;
}

function resolveApiCategory(categories: Category[], requested?: string | null): Category | undefined {
  const publicCategory = getPublicCategory(requested);
  if (!publicCategory) return undefined;
  return categories.find((category) => matchesPublicCategory(category.name, publicCategory));
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const categories = await getCategories();
  const publicCategory = getPublicCategory(rawCategory);
  const category = resolveApiCategory(categories, rawCategory);

  if (!publicCategory || !category) {
    return {
      title: 'تصنيفات الأخبار',
      description: 'تصفح التقارير والمواد التحريرية الأصلية في مدى العالم.',
      alternates: { canonical: `${siteUrl.replace(/\/$/, '')}/categories` },
      robots: { index: false, follow: true },
      openGraph: {
        type: 'website',
        url: `${siteUrl.replace(/\/$/, '')}/categories`,
        title: 'تصنيفات الأخبار',
        description: 'تصفح التقارير والمواد التحريرية الأصلية في مدى العالم.',
        siteName: 'مدى العالم',
        locale: 'ar_AR',
        images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'تصنيفات الأخبار',
        description: 'تصفح التقارير والمواد التحريرية الأصلية في مدى العالم.',
        images: ['/icons/icon-512.png'],
      },
    };
  }

  const label = publicCategory.label;
  const canonical = `${siteUrl.replace(/\/$/, '')}${categoryUrl(publicCategory.key)}`;

  return {
    title: `${label} | تقارير مدى العالم`,
    description: `تقارير ومواد تحريرية أصلية أعدّها مدى العالم في قسم ${label}.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${label} | تقارير مدى العالم`,
      description: `مواد تحريرية أصلية أعدّها مدى العالم في قسم ${label}.`,
      siteName: 'مدى العالم',
      locale: 'ar_AR',
      images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'مدى العالم' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} | تقارير مدى العالم`,
      description: `مواد تحريرية أصلية أعدّها مدى العالم في قسم ${label}.`,
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
  const selectedPublicCategory = getPublicCategory(rawCategory);
  const selectedCategory = resolveApiCategory(categories, rawCategory);
  const originalArticles = selectedPublicCategory && !selectedCategory
    ? []
    : await getOriginalArticles(selectedCategory?.id);
  const selectedLabel = selectedPublicCategory?.label ?? '';

  return (
    <main dir="rtl" className="mada-page bg-transparent">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPublicCategory && selectedCategory ? `تقارير ${selectedLabel}` : 'أقسام التقارير'}
          </h1>
          <p className="mt-2 text-gray-500">
            {selectedPublicCategory && selectedCategory
              ? `تقارير ومواد تحريرية أعدّها مدى العالم في قسم ${selectedLabel}.`
              : 'تصفح التقارير والمواد التحريرية التي أعدّها مدى العالم حسب القسم.'}
          </p>
        </header>

        <nav aria-label="تصنيفات الأخبار" className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">الأقسام</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/categories"
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                !selectedPublicCategory ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              الكل
            </Link>
            {PUBLIC_CATEGORIES.map((category) => (
              <Link
                key={category.key}
                href={categoryUrl(category.key)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  selectedPublicCategory?.key === category.key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </nav>

        <section className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm" aria-labelledby="category-original-heading">
          <div className="mb-5">
            <span className="text-xs font-black text-blue-700">خاص مدى العالم</span>
            <h2 id="category-original-heading" className="mt-1 text-2xl font-black">مواد أعدّها مدى العالم</h2>
          </div>
          {originalArticles.length === 0 ? (
            <p className="text-gray-500">لا توجد مواد تحريرية منشورة في هذا القسم حاليًا.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {originalArticles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-2xl border border-slate-100">
                  {article.imageUrl && <img src={article.imageUrl} alt="" width={600} height={338} className="h-48 w-full object-cover" />}
                  <div className="p-4">
                    <span className="text-[11px] font-black text-blue-700">خاص مدى العالم</span>
                    <h3 className="mt-2 font-black leading-7"><Link href={`/articles/${encodeURIComponent(article.id)}`}>{article.title}</Link></h3>
                    {article.description && <p className="mt-2 line-clamp-3 text-sm text-slate-500">{article.description}</p>}
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
