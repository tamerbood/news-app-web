'use client';

import { FormEvent, useEffect, useState } from 'react';

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
  websiteUrl: string;
  rssUrl: string;
  logoUrl: string | null;
  isActive: boolean;
  isGlobal: boolean;
  categoryId: string | null;
  category?: Category | null;
  countryId: string | null;
  country?: Country | null;
};

type SourceForm = {
  name: string;
  websiteUrl: string;
  rssUrl: string;
  logoUrl: string;
  categoryId: string;
  countryId: string;
  isActive: boolean;
  isGlobal: boolean;
};

const emptyForm: SourceForm = {
  name: '',
  websiteUrl: '',
  rssUrl: '',
  logoUrl: '',
  categoryId: '',
  countryId: '',
  isActive: true,
  isGlobal: false,
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] =
    useState<Source | null>(null);

  const [form, setForm] =
    useState<SourceForm>(emptyForm);

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
        sourcesResponse,
        categoriesResponse,
        countriesResponse,
      ] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sources`,
          {
            headers,
          },
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            headers,
          },
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/countries`,
          {
            headers,
          },
        ),
      ]);

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

      if (!countriesResponse.ok) {
        throw new Error(
          `Failed to load countries: ${countriesResponse.status}`,
        );
      }

      const sourcesData =
          await sourcesResponse.json();

      const categoriesData =
          await categoriesResponse.json();

      const countriesData =
          await countriesResponse.json();

      setSources(
        sourcesData.value ?? sourcesData,
      );

      setCategories(
        categoriesData.value ?? categoriesData,
      );

      setCountries(
        countriesData.value ?? countriesData,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load data',
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingSource(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setShowForm(true);
  }

  function openEditForm(source: Source) {
    setEditingSource(source);

    setForm({
      name: source.name,
      websiteUrl: source.websiteUrl,
      rssUrl: source.rssUrl,
      logoUrl: source.logoUrl ?? '',
      categoryId: source.categoryId ?? '',
      countryId: source.countryId ?? '',
      isActive: source.isActive,
      isGlobal: source.isGlobal ?? false,
    });

    setMessage('');
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingSource(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof SourceForm,
    value: string | boolean,
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
        name: form.name.trim(),
        websiteUrl: form.websiteUrl.trim(),
        rssUrl: form.rssUrl.trim(),
        logoUrl:
          form.logoUrl.trim() || undefined,
        isActive: form.isActive,
        isGlobal: form.isGlobal,
        categoryId:
          form.categoryId || undefined,
        countryId:
  form.countryId || null,
      };

      const url = editingSource
        ? `${process.env.NEXT_PUBLIC_API_URL}/sources/${editingSource.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sources`;

      const method = editingSource
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
        editingSource
          ? 'Source updated successfully.'
          : 'Source created successfully.',
      );

      setShowForm(false);
      setEditingSource(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save source',
      );
    } finally {
      setSaving(false);
    }
  }

  async function importCsv(file: File) {
    try {
      setImporting(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sources/import-csv`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          body?.message ?? `Import failed: ${response.status}`,
        );
      }

      setMessage(
        `Import complete: ${body.imported} imported, ${body.duplicate} duplicate, ${body.invalidRss} invalid RSS, ${body.failed} failed.`,
      );
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import CSV',
      );
    } finally {
      setImporting(false);
    }
  }

  async function deleteSource(source: Source) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${source.name}"?`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/sources/${source.id}`,
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
        `Source "${source.name}" deleted successfully.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete source',
      );
    }
  }

  async function toggleActive(source: Source) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/sources/${source.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !source.isActive,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Update failed: ${response.status} ${body}`,
        );
      }

      setMessage(
        `${source.name} is now ${
          !source.isActive
            ? 'active'
            : 'inactive'
        }.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update source',
      );
    }
  }

  function getCategoryName(source: Source) {
    if (source.category?.name) {
      return source.category.name;
    }

    const category = categories.find(
      (item) => item.id === source.categoryId,
    );

    return category?.name ?? 'Uncategorized';
  }

  function getCountry(source: Source) {
    if (source.country) {
      return source.country;
    }

    return countries.find(
      (country) =>
        country.id === source.countryId,
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
              Sources
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage RSS news sources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
              {importing ? 'Importing...' : '↑ Import RSS CSV'}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={importing}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void importCsv(file);
                }}
              />
            </label>

            <button
              onClick={openAddForm}
              className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              + Add Source
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
                  {editingSource
                    ? 'Edit Source'
                    : 'Add Source'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the source information below.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="BBC News"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Country
                </label>

                <select

                  value={form.countryId}
                  onChange={(event) =>
                    updateForm(
                      'countryId',
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    No country
                  </option>

                  {countries.map((country) => (
                    <option
                      key={country.id}
                      value={country.id}
                    >
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    updateForm(
                      'categoryId',
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Uncategorized
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Website URL
                </label>

                <input
                  required
                  type="url"
                  value={form.websiteUrl}
                  onChange={(event) =>
                    updateForm(
                      'websiteUrl',
                      event.target.value,
                    )
                  }
                  placeholder="https://www.bbc.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  RSS URL
                </label>

                <input
                  required
                  type="url"
                  value={form.rssUrl}
                  onChange={(event) =>
                    updateForm(
                      'rssUrl',
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com/rss.xml"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Logo URL
                </label>

                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(event) =>
                    updateForm(
                      'logoUrl',
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-8 md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      updateForm(
                        'isActive',
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Source is active
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    id="isGlobal"
                    type="checkbox"
                    checked={form.isGlobal}
                    onChange={(event) =>
                      updateForm(
                        'isGlobal',
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Global source (For You)
                  </span>
                </label>
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingSource
                      ? 'Save Changes'
                      : 'Create Source'}
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

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Sources
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {sources.length} sources
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
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Loading sources...
            </div>
          ) : sources.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              No sources found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sources.map((source) => {
                const country =
                  getCountry(source);

                return (
                  <div
                    key={source.id}
                    className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {source.name}
                        </h3>

                        {country && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                            {country.flag}{' '}
                            {country.name}
                          </span>
                        )}

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          {getCategoryName(
                            source,
                          )}
                        </span>

                        <span
                          className={
                            source.isActive
                              ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600'
                              : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500'
                          }
                        >
                          {source.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>

                        {source.isGlobal && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Global
                          </span>
                        )}
                      </div>

                      <p className="mt-2 truncate text-sm text-gray-500">
                        {source.rssUrl}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() =>
                          toggleActive(source)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {source.isActive
                          ? 'Disable'
                          : 'Enable'}
                      </button>

                      <button
                        onClick={() =>
                          openEditForm(source)
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteSource(source)
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
