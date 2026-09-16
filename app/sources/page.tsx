import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

type Category = {
  id: string;
  name: string;
};

type Country = {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  flag?: string;
};

type Source = {
  id: string;
  name: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  isGlobal?: boolean;
  categoryId?: string | null;
  category?: Category | null;
  countryId?: string | null;
  country?: Country | null;
};

function unwrap<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];

  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

async function getSources(): Promise<Source[]> {
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/sources`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return unwrap<Source>(data, ['value', 'data', 'sources']).filter(
      (source) => source?.id && source?.name && source.isActive !== false,
    );
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];

    return unwrap<Category>(await response.json(), ['value', 'data', 'categories']);
  } catch {
    return [];
  }
}

async function getCountries(): Promise<Country[]> {
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/countries`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];

    return unwrap<Country>(await response.json(), ['value', 'data', 'countries']);
  } catch {
    return [];
  }
}

export default async function SourcesPage() {
  const [sources, categories, countries] = await Promise.all([
    getSources(),
    getCategories(),
    getCountries(),
  ]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const countryById = new Map(countries.map((country) => [country.id, country]));

  return (
    <main dir="rtl" className="mada-page min-h-screen bg-transparent">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">مصادر الأخبار</h1>
          <p className="mt-2 max-w-3xl text-gray-500">
            تعرّف على مصادر الأخبار التي تعتمد عليها مدى العالم لجمع الأخبار وتقديمها في مكان واحد.
          </p>
        </header>

        {sources.length === 0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">لا توجد مصادر متاحة حاليًا</h2>
            <p className="mt-2 text-gray-500">يمكنك العودة إلى الصفحة الرئيسية لاستعراض آخر الأخبار.</p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              العودة إلى الرئيسية
            </Link>
          </section>
        ) : (
          <section aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="sr-only">قائمة مصادر الأخبار</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((source) => {
                const category = source.category ?? (source.categoryId ? categoryById.get(source.categoryId) : undefined);
                const country = source.country ?? (source.countryId ? countryById.get(source.countryId) : undefined);

                return (
                  <article key={source.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      {source.logoUrl ? (
                        <img
                          src={source.logoUrl}
                          alt=""
                          width={56}
                          height={56}
                          loading="lazy"
                          className="h-14 w-14 rounded-xl object-contain bg-gray-50"
                        />
                      ) : (
                        <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-500">
                          {source.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          {country?.name && <span className="rounded-full bg-gray-100 px-2.5 py-1">{country.flag ? `${country.flag} ` : ''}{country.name}</span>}
                          {category?.name && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{category.name}</span>}
                          {source.isGlobal && <span className="rounded-full bg-gray-100 px-2.5 py-1">عالمي</span>}
                        </div>
                      </div>
                    </div>

                    {source.websiteUrl && (
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:underline"
                      >
                        زيارة موقع المصدر ↗
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
