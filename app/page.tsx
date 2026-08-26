'use client';

import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type Category = {
  id: string;
  name: string;
};

type Country = {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  flag: string;
};

type Source = {
  id: string;
  name: string;
  categoryId?: string;
};

type Article = {
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
};

const ARTICLES_PER_PAGE = 20;

export default function HomePage() {
  const [articles, setArticles] =
    useState<Article[]>([]);

const [categories, setCategories] =
  useState<Category[]>([]);

const [countries, setCountries] =
  useState<Country[]>([]);

const [countryCode, setCountryCode] =
  useState('');

  const [sources, setSources] =
    useState<Source[]>([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalArticles, setTotalArticles] =
    useState(0);

  const [search, setSearch] =
    useState('');

  const [activeSearch, setActiveSearch] =
    useState('');

  const [categoryId, setCategoryId] =
    useState('');

  const [sourceId, setSourceId] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // Favorites
  const [favoriteIds, setFavoriteIds] =
    useState<Set<string>>(new Set());

  const [favoriteLoading, setFavoriteLoading] =
    useState<string | null>(null);

  /*
   * Load Categories and Sources
   */
  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;


    if (!apiUrl) {
      setError(
        'NEXT_PUBLIC_API_URL is not configured.',
      );

      setLoading(false);
      return;
    }

    async function loadFilters() {
      try {
const [
  categoriesResponse,
  sourcesResponse,
  countriesResponse,
] = await Promise.all([
  fetch(`${apiUrl}/categories`, {
    cache: 'no-store',
  }),

  fetch(`${apiUrl}/sources`, {
    cache: 'no-store',
  }),

  fetch(`${apiUrl}/countries`, {
    cache: 'no-store',
  }),
]);

        if (!categoriesResponse.ok) {
          throw new Error(
            'Failed to load categories',
          );
        }

        if (!sourcesResponse.ok) {
          throw new Error(
            'Failed to load sources',
          );
        }

        if (!countriesResponse.ok) {
          throw new Error(
            'Failed to load countries',
          );
        }

        const categoriesData =
          await categoriesResponse.json();

        const sourcesData =
          await sourcesResponse.json();

        const countriesData =
          await countriesResponse.json();

        setCategories(
          categoriesData.value ??
            categoriesData,
        );

        setSources(
          sourcesData.value ??
            sourcesData,
        );

        const loadedCountries =
          countriesData.value ??
          countriesData;

        const countryOrder = [
          'JO',
          'SY',
          'EG',
          'SA',
          'AE',
          'QA',
          'KW',
          'BH',
          'OM',
          'YE',
          'IQ',
          'LB',
          'PS',
          'LY',
          'TN',
          'DZ',
          'MA',
          'SD',
        ];

        setCountries(
          [...loadedCountries].sort(
            (a: Country, b: Country) =>
              countryOrder.indexOf(a.code) -
              countryOrder.indexOf(b.code),
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load filters',
        );
      }
    }

    loadFilters();
  }, []);

  /*
   * Load Articles
   *
   * Supports:
   * - Search
   * - Country
   * - Category
   * - Source
   * - Pagination
   * - Automatic refresh every 60 seconds
   */
  useEffect(() => {
    let isMounted = true;

    async function loadArticles() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            'NEXT_PUBLIC_API_URL is not configured.',
          );
        }

        const params =
          new URLSearchParams();

        params.set(
          'page',
          String(page),
        );

        params.set(
          'limit',
          String(ARTICLES_PER_PAGE),
        );

        if (activeSearch.trim()) {
          params.set(
            'search',
            activeSearch.trim(),
          );
        }

        if (categoryId) {
          params.set(
            'categoryId',
            categoryId,
          );
        }

        if (sourceId) {
          params.set(
            'sourceIds',
            sourceId,
          );
        }

        if (countryCode) {
          params.set(
            'countryCode',
            countryCode,
          );
        }

        const query =
          params.toString();

        const response =
          await fetch(
            `${apiUrl}/articles?${query}`,
            {
              cache: 'no-store',
            },
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load articles (${response.status})`,
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        /*
         * New paginated API response
         */
        setArticles(
          data.items ?? [],
        );

        setTotalArticles(
          data.total ?? 0,
        );

        setTotalPages(
          data.totalPages ?? 1,
        );

        setError('');
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load articles',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    setLoading(true);

    loadArticles();

    /*
     * Refresh news every 60 seconds
     */
    const interval =
      setInterval(
        loadArticles,
        60 * 1000,
      );

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    activeSearch,
    categoryId,
    sourceId,
    countryCode,
    page,
  ]);

  /*
   * Load user's Favorites
   */
  useEffect(() => {
    async function loadFavorites() {
      const token =
        localStorage.getItem(
          'user_token',
        );

      if (!token) {
        setFavoriteIds(
          new Set(),
        );

        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        return;
      }

      try {
        const response =
          await fetch(
            `${apiUrl}/bookmarks`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache: 'no-store',
            },
          );

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            setFavoriteIds(
              new Set(),
            );
          }

          return;
        }

        const data =
          await response.json();

        const bookmarks =
          data.value ?? data;

        const ids =
          new Set<string>(
            bookmarks.map(
              (article: Article) =>
                article.id,
            ),
          );

        setFavoriteIds(ids);
      } catch (err) {
        console.error(
          'Failed to load favorites:',
          err,
        );
      }
    }

    loadFavorites();
  }, []);

  /*
   * Search
   */
  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    setPage(1);

    setActiveSearch(
      search.trim(),
    );
  }

  /*
   * Clear Search
   */
  function clearSearch() {
    setSearch('');
    setActiveSearch('');
    setPage(1);
  }

  /*
   * Clear all filters
   */
  function clearFilters() {
    setSearch('');
    setActiveSearch('');
    setCategoryId('');
    setSourceId('');
    setCountryCode('');
    setPage(1);
  }

  /*
   * Add / Remove Favorite
   */
  async function toggleFavorite(
    articleId: string,
  ) {
    const token =
      localStorage.getItem(
        'user_token',
      );

    /*
     * User is not logged in.
     */
    if (!token) {
      window.location.href =
        '/login';

      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return;
    }

    const isFavorite =
      favoriteIds.has(articleId);

    setFavoriteLoading(
      articleId,
    );

    try {
      const response =
        await fetch(
          `${apiUrl}/bookmarks/${articleId}`,
          {
            method: isFavorite
              ? 'DELETE'
              : 'POST',

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      /*
       * Invalid token
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

        setFavoriteIds(
          new Set(),
        );

        window.location.href =
          '/login';

        return;
      }

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ??
            'Failed to update favorite',
        );
      }

      /*
       * Update UI immediately
       */
      setFavoriteIds(
        (previous) => {
          const next =
            new Set(previous);

          if (isFavorite) {
            next.delete(
              articleId,
            );
          } else {
            next.add(
              articleId,
            );
          }

          return next;
        },
      );
    } catch (err) {
      console.error(
        'Favorite error:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update favorite',
      );
    } finally {
      setFavoriteLoading(
        null,
      );
    }
  }

  /*
   * Pagination helpers
   */
  function goToPage(
    pageNumber: number,
  ) {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === page
    ) {
      return;
    }

    setPage(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function getPageNumbers() {
    const pages: (
      number | 'ellipsis'
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push('ellipsis');
    }

    const start =
      Math.max(
        2,
        page - 1,
      );

    const end =
      Math.min(
        totalPages - 1,
        page + 1,
      );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      page <
      totalPages - 3
    ) {
      pages.push('ellipsis');
    }

    pages.push(
      totalPages,
    );

    return pages;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Latest Articles
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {activeSearch ||
            countryCode ||
            categoryId ||
            sourceId
              ? `${totalArticles} filtered articles`
              : `${totalArticles} articles available`}
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search news..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {/* Country */}
          <select
            value={countryCode}
            onChange={(event) => {
              setCountryCode(
                event.target.value,
              );

              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-black"
          >
            <option value="">
              All Countries
            </option>

            {countries.map(
              (country) => (
                <option
                  key={country.id}
                  value={country.code}
                >
                  {country.flag} {country.name}
                </option>
              ),
            )}
          </select>

          {/* Category */}
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(
                event.target.value,
              );

              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-black"
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>

          {/* Source */}
          <select
            value={sourceId}
            onChange={(event) => {
              setSourceId(
                event.target.value,
              );

              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-black"
          >
            <option value="">
              All Sources
            </option>

            {sources.map(
              (source) => (
                <option
                  key={source.id}
                  value={source.id}
                >
                  {source.name}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Clear Filters */}
        {(activeSearch ||
          countryCode ||
          categoryId ||
          sourceId) && (
          <div className="mb-6">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center">
            Loading articles...
          </div>
        )}

        {/* Error */}
        {!loading &&
          error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

        {/* No Articles */}
        {!loading &&
          !error &&
          articles.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center">
              <p className="text-gray-500">
                No articles found.
              </p>

              {(activeSearch ||
                countryCode ||
                categoryId ||
                sourceId) && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-4 rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Show All Articles
                </button>
              )}
            </div>
          )}

        {/* Articles */}
        {!loading &&
          !error &&
          articles.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {articles.map(
                  (article) => {
                    const isFavorite =
                      favoriteIds.has(
                        article.id,
                      );

                    const isFavoriteLoading =
                      favoriteLoading ===
                      article.id;

                    return (
                      <article
                        key={article.id}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                      >

{/* Image */}
<img
  src={
    article.imageUrl?.trim()
      ? article.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}/assets/images/news-placeholder.png`
  }
  alt={article.title}
  className="h-52 w-full object-cover"
/>

                        <div className="p-5">

                          {/* Source + Category */}
                          <div className="mb-3 flex flex-wrap gap-2 text-xs">

                            {article
                              .source
                              ?.name && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                                {
                                  article
                                    .source
                                    .name
                                }
                              </span>
                            )}

                            {article
                              .category
                              ?.name && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                                {
                                  article
                                    .category
                                    .name
                                }
                              </span>
                            )}

                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900">
                            {
                              article.title
                            }
                          </h3>

                          {/* Description */}
                          {article.description && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                              {
                                article.description
                              }
                            </p>
                          )}

                          {/* Bottom */}
                          <div className="mt-5 flex flex-col gap-3">

                            <div className="flex items-center justify-between gap-3">

                              {/* Date */}
                              {article.publishedAt ? (
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    article.publishedAt,
                                  ).toLocaleDateString()}
                                </span>
                              ) : (
                                <span />
                              )}

                              {/* Read Article */}
                              <Link
                                href={`/articles/${article.id}`}
                                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                              >
                                Read Article
                              </Link>

                            </div>

                            {/* Favorite */}
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite(
                                  article.id,
                                )
                              }
                              disabled={
                                isFavoriteLoading
                              }
                              className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                isFavorite
                                  ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {isFavoriteLoading
                                ? 'Updating...'
                                : isFavorite
                                  ? '★ Remove from Favorites'
                                  : '☆ Add to Favorites'}
                            </button>

                          </div>
                        </div>
                      </article>
                    );
                  },
                )}

              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        page - 1,
                      )
                    }
                    disabled={
                      page === 1
                    }
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map(
                    (
                      pageNumber,
                      index,
                    ) =>
                      pageNumber ===
                      'ellipsis' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={
                            pageNumber
                          }
                          type="button"
                          onClick={() =>
                            goToPage(
                              pageNumber,
                            )
                          }
                          className={`min-w-10 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            page ===
                            pageNumber
                              ? 'bg-black text-white'
                              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      ),
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        page + 1,
                      )
                    }
                    disabled={
                      page ===
                      totalPages
                    }
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>

                </div>
              )}
            </>
          )}

      </section>
    </main>
  );
}