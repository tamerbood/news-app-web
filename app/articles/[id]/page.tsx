'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  createdAt?: string;

  source?: {
    id: string;
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
  };

  category?: {
    id: string;
    name: string;
  };
}

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] =
    useState<Article | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [favoriteMessage, setFavoriteMessage] =
    useState('');

  /*
   * Load Article
   */
  useEffect(() => {
    async function loadArticle() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            'NEXT_PUBLIC_API_URL is not configured.',
          );
        }

        const response = await fetch(
          `${apiUrl}/articles/${encodeURIComponent(id)}`,
          {
            cache: 'no-store',
          },
        );

        const contentType =
          response.headers.get('content-type') ?? '';

        if (
          !contentType.includes('application/json')
        ) {
          throw new Error(
            `API returned a non-JSON response (HTTP ${response.status}).`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ??
              'Failed to load article.',
          );
        }

        setArticle(data);

        /*
         * Check Favorite
         */
        const token =
          localStorage.getItem('user_token');

        if (!token) {
          return;
        }

        try {
          const favoriteResponse =
            await fetch(
              `${apiUrl}/bookmarks/${encodeURIComponent(
                id,
              )}/check`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
                cache: 'no-store',
              },
            );

          /*
           * Token expired / invalid
           */
          if (
            favoriteResponse.status === 401
          ) {
            localStorage.removeItem(
              'user_token',
            );

            localStorage.removeItem(
              'user',
            );

            return;
          }

          if (favoriteResponse.ok) {
            const favoriteData =
              await favoriteResponse.json();

            setIsFavorite(
              favoriteData.isFavorite === true,
            );
          }
        } catch {
          /*
           * Favorite check failure should
           * not prevent article loading.
           */
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load article.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadArticle();
    }
  }, [id]);

  /*
   * Add / Remove Favorite
   */
  async function toggleFavorite() {
    const token =
      localStorage.getItem('user_token');

    /*
     * User is not logged in
     */
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setFavoriteMessage(
        'API URL is not configured.',
      );
      return;
    }

    setFavoriteLoading(true);
    setFavoriteMessage('');

    try {
      const method = isFavorite
        ? 'DELETE'
        : 'POST';

      const response =
        await fetch(
          `${apiUrl}/bookmarks/${encodeURIComponent(id)}`,
          {
            method,
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const data =
        await response
          .json()
          .catch(() => null);

      /*
       * Invalid / expired token
       */
      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          'user_token',
        );

        localStorage.removeItem(
          'user',
        );

        window.location.href =
          '/login';

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ??
            'Failed to update favorites.',
        );
      }

      /*
       * Update UI
       */
      const newFavoriteState =
        !isFavorite;

      setIsFavorite(
        newFavoriteState,
      );

      setFavoriteMessage(
        newFavoriteState
          ? 'Article added to favorites.'
          : 'Article removed from favorites.',
      );
    } catch (err) {
      setFavoriteMessage(
        err instanceof Error
          ? err.message
          : 'Failed to update favorites.',
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading article...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error / Not Found
   */
  if (error || !article) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Article not found
            </h1>

            <p className="mt-3 text-gray-500">
              {error ||
                'The requested article could not be found.'}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Back to News
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Article Page
   */
  return (
    <main className="min-h-screen bg-gray-100">
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <span aria-hidden="true">
            ←
          </span>
          Back to News
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Article Image */}
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-[260px] w-full object-cover sm:h-[340px] md:h-[450px]"
            />
          )}

          <div className="p-6 sm:p-8 md:p-10">
            {/* Source + Category */}
            <div className="mb-5 flex flex-wrap gap-2">
              {article.source?.name && (
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {article.source.name}
                </span>
              )}

              {article.category?.name && (
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  {article.category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
              {article.title}
            </h1>

            {/* Date */}
            {article.publishedAt && (
              <div className="mt-5 text-sm text-gray-500">
                Published on{' '}
                {new Date(
                  article.publishedAt,
                ).toLocaleDateString()}
              </div>
            )}

            {/* Description */}
            {article.description && (
              <div className="mt-8">
                <p className="text-lg leading-8 text-gray-700">
                  {article.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center">
              {/* Favorite */}
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`rounded-xl px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isFavorite
                    ? 'border border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {favoriteLoading
                  ? 'Updating...'
                  : isFavorite
                    ? '★ Remove from Favorites'
                    : '☆ Add to Favorites'}
              </button>

              {/* Original Article */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Read Original Article →
              </a>
            </div>

            {/* Favorite Message */}
            {favoriteMessage && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                  favoriteMessage.includes(
                    'added',
                  )
                    ? 'bg-green-50 text-green-700'
                    : favoriteMessage.includes(
                          'removed',
                        )
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-50 text-red-700'
                }`}
              >
                {favoriteMessage}
              </div>
            )}

            {/* Source Website */}
            {article.source?.websiteUrl && (
              <div className="mt-8 border-t pt-6">
                <p className="text-sm text-gray-500">
                  Source
                </p>

                <a
                  href={
                    article.source.websiteUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  {article.source.name}
                </a>
              </div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}