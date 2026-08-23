'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

export default function FavoritesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFavorites() {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('user_token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/bookmarks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ?? 'Failed to load favorites',
        );
      }

      setArticles(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load favorites',
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(
    articleId: string,
  ) {
    try {
      const token =
        localStorage.getItem('user_token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/bookmarks/${articleId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message ?? 'Failed to remove favorite',
        );
      }

      setArticles((current) =>
        current.filter(
          (article) => article.id !== articleId,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove favorite',
      );
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            â† Back to News
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Favorites
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Articles you saved for later.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center">
            Loading favorites...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          articles.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                No favorites yet
              </h2>

              <p className="mt-2 text-gray-500">
                Save articles and they will appear here.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Browse News
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          articles.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      {article.source?.name && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                          {article.source.name}
                        </span>
                      )}

                      {article.category?.name && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                          {article.category.name}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                      {article.title}
                    </h2>

                    {article.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {article.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link
                        href={`/articles/${article.id}`}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Open Article
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          removeFavorite(article.id)
                        }
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}