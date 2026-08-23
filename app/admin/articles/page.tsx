'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Source = {
  id: string;
  name: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
};

type Category = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  sourceId: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string | null;
  source?: Source | null;
};

type ArticleForm = {
  sourceId: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
};

const emptyForm: ArticleForm = {
  sourceId: '',
  title: '',
  description: '',
  url: '',
  imageUrl: '',
  publishedAt: '',
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] =
    useState('');
  const [categoryFilter, setCategoryFilter] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] =
    useState<Article | null>(null);

  const [form, setForm] =
    useState<ArticleForm>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        articlesResponse,
        sourcesResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sources`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers,
        }),
      ]);

      if (!articlesResponse.ok) {
        throw new Error(
          `Failed to load articles: ${articlesResponse.status}`,
        );
      }

      if (!sourcesResponse.ok) {
        throw new Error(
          `Failed to load sources: ${sourcesResponse.status}`,
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          `Failed to load categories: ${categoriesResponse.status}`,
        );
      }

      const articlesData =
        await articlesResponse.json();

      const sourcesData =
        await sourcesResponse.json();

      const categoriesData =
        await categoriesResponse.json();

     const loadedArticles =
  articlesData.value ?? articlesData;

setArticles(
  [...loadedArticles].sort((a, b) => {
    const dateA = a.publishedAt
      ? new Date(a.publishedAt).getTime()
      : 0;

    const dateB = b.publishedAt
      ? new Date(b.publishedAt).getTime()
      : 0;

    return dateB - dateA;
  }),
);

      setSources(
        sourcesData.value ?? sourcesData,
      );

      setCategories(
        categoriesData.value ?? categoriesData,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load articles',
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !searchValue ||
        article.title
          .toLowerCase()
          .includes(searchValue) ||
        (article.description ?? '')
          .toLowerCase()
          .includes(searchValue);

      const matchesSource =
        !sourceFilter ||
        article.sourceId === sourceFilter;

      const articleCategoryId =
        article.source?.categoryId ??
        article.source?.category?.id ??
        null;

      const matchesCategory =
        !categoryFilter ||
        articleCategoryId === categoryFilter;

      return (
        matchesSearch &&
        matchesSource &&
        matchesCategory
      );
    });
  }, [
    articles,
    search,
    sourceFilter,
    categoryFilter,
  ]);

 function openAddForm() {
  setEditingArticle(null);

  setForm({
    ...emptyForm,
    publishedAt: toDateTimeLocal(new Date().toISOString()),
  });

  setError('');
  setMessage('');
  setShowForm(true);
  }

  function openEditForm(article: Article) {
    setEditingArticle(article);

    setForm({
      sourceId: article.sourceId,
      title: article.title,
      description: article.description ?? '',
      url: article.url,
      imageUrl: article.imageUrl ?? '',
      publishedAt: article.publishedAt
        ? toDateTimeLocal(article.publishedAt)
        : '',
    });

    setError('');
    setMessage('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingArticle(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof ArticleForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const payload = {
        sourceId: form.sourceId,
        title: form.title.trim(),
        description:
          form.description.trim() || undefined,
        url: form.url.trim(),
        imageUrl:
          form.imageUrl.trim() || undefined,
       publishedAt: form.publishedAt
  ? new Date(form.publishedAt).toISOString()
  : editingArticle
    ? undefined
    : new Date().toISOString(),
      };

      const url = editingArticle
        ? `${process.env.NEXT_PUBLIC_API_URL}/articles/${editingArticle.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/articles`;

      const method = editingArticle
        ? 'PATCH'
        : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Request failed: ${response.status} ${body}`,
        );
      }

      setMessage(
        editingArticle
          ? 'Article updated successfully.'
          : 'Article created successfully.',
      );

      closeForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save article',
      );
    } finally {
      setSaving(false);
    }
  }

  async function syncNews() {
    try {
      setSyncing(true);
      setError('');
      setMessage('');

      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rss/sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const contentType =
        response.headers.get('content-type') ?? '';

      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `News sync failed: ${response.status}`,
        );
      }

      const results = Array.isArray(data?.sources)
        ? data.sources
        : [];

      const created = results.reduce(
        (total: number, source: any) =>
          total + Number(source.created ?? 0),
        0,
      );

      const updated = results.reduce(
        (total: number, source: any) =>
          total + Number(source.updated ?? 0),
        0,
      );

      setMessage(
        `News sync completed successfully. ${created} new articles added, ${updated} articles updated.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to sync news',
      );
    } finally {
      setSyncing(false);
    }
  }

  async function deleteArticle(article: Article) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this article?\n\n${article.title}`,
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${article.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Delete failed: ${response.status} ${body}`,
        );
      }

      setMessage(
        'Article deleted successfully.',
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete article',
      );
    }
  }

  function getSourceName(article: Article) {
    if (article.source?.name) {
      return article.source.name;
    }

    return (
      sources.find(
        (source) => source.id === article.sourceId,
      )?.name ?? 'Unknown source'
    );
  }

  function getCategoryName(article: Article) {
    if (article.source?.category?.name) {
      return article.source.category.name;
    }

    const categoryId =
      article.source?.categoryId;

    if (!categoryId) {
      return 'Uncategorized';
    }

    return (
      categories.find(
        (category) => category.id === categoryId,
      )?.name ?? 'Uncategorized'
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => {
                window.location.href = '/admin';
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Admin Dashboard
            </button>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Articles
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage news articles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={syncNews}
              disabled={syncing}
              className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? 'Fetching News...' : '↻ Fetch News Now'}
            </button>

            <button
              onClick={openAddForm}
              disabled={syncing}
              className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Article
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingArticle
                    ? 'Edit Article'
                    : 'Add Article'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the article information.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Source
                  </label>

                  <select
                    required
                    value={form.sourceId}
                    onChange={(event) =>
                      updateForm(
                        'sourceId',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select source
                    </option>

                    {sources.map((source) => (
                      <option
                        key={source.id}
                        value={source.id}
                      >
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Published At
                  </label>

                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(event) =>
                      updateForm(
                        'publishedAt',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title
                </label>

                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      'title',
                      event.target.value,
                    )
                  }
                  placeholder="Article title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Article description"
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Article URL
                </label>

                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    updateForm(
                      'url',
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com/article"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Image URL
                </label>

                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    updateForm(
                      'imageUrl',
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {form.imageUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Image Preview
                  </p>

                  <img
                    src={form.imageUrl}
                    alt="Article preview"
                    className="h-48 w-full max-w-md rounded-xl object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        'none';
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingArticle
                      ? 'Save Changes'
                      : 'Create Article'}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search articles..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Source
              </label>

              <select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  All Sources
                </option>

                {sources.map((source) => (
                  <option
                    key={source.id}
                    value={source.id}
                  >
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Articles
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredArticles.length} of{' '}
                {articles.length} articles
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Loading articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              No articles found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-5 px-6 py-5 lg:flex-row"
                >
                  <div className="shrink-0">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-28 w-full rounded-xl object-cover lg:w-44"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400 lg:w-44">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {getSourceName(article)}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {getCategoryName(article)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold leading-6 text-gray-900">
                      {article.title}
                    </h3>

                    {article.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {article.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {article.publishedAt && (
                        <span>
                          {formatDate(
                            article.publishedAt,
                          )}
                        </span>
                      )}

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open Article →
                      </a>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-2">
                    <button
                      onClick={() =>
                        openEditForm(article)
                      }
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteArticle(article)
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  const pad = (number: number) =>
    number.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
