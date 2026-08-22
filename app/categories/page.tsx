'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source?: {
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>('');
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [loadingArticles, setLoadingArticles] =
    useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();

  const categoryFromUrl =
    searchParams.get('category');

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  async function loadArticles(
    categoryId: string,
  ) {
    setSelectedCategory(categoryId);
    setLoadingArticles(true);
    setError('');

    try {
      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/articles?categoryId=${encodeURIComponent(
          categoryId,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load articles (${response.status})`,
        );
      }

      const data = await response.json();

      setArticles(
        Array.isArray(data)
          ? data
          : data.articles ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load articles.',
      );
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        if (!apiUrl) {
          throw new Error(
            'NEXT_PUBLIC_API_URL is not configured.',
          );
        }

        const response = await fetch(
          `${apiUrl}/categories`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load categories (${response.status})`,
          );
        }

        const data = await response.json();

        const loadedCategories: Category[] =
          Array.isArray(data)
            ? data
            : data.categories ?? [];

        setCategories(loadedCategories);

        if (categoryFromUrl) {
          const matchingCategory =
            loadedCategories.find(
              (category: Category) =>
                category.name.toLowerCase() ===
                categoryFromUrl.toLowerCase(),
            );

          if (matchingCategory) {
            loadArticles(matchingCategory.id);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load categories.',
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [apiUrl, categoryFromUrl]);

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-2 text-gray-500">
            Browse the latest news by category.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            News Categories
          </h2>

          {loadingCategories ? (
            <p className="text-gray-500">
              Loading categories...
            </p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">
              No categories found.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    loadArticles(category.id)
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    selectedCategory === category.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedCategory && (
          <section className="mt-8">
            <h2 className="mb-5 text-2xl font-bold text-gray-900">
              {categories.find(
                (category) =>
                  category.id === selectedCategory,
              )?.name ?? 'Articles'}
            </h2>

            {loadingArticles ? (
              <p className="text-gray-500">
                Loading articles...
              </p>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  No articles found in this category.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
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

                        {article.category?.name && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                            {article.category.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">
                        {article.title}
                      </h3>

                      {article.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {article.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(
                            article.publishedAt,
                          ).toLocaleDateString()}
                        </span>

                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          Read Article
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100">
          <section className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-gray-500">
              Loading categories...
            </p>
          </section>
        </main>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}