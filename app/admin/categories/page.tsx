'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type Source = {
  id: string;
  name: string;
  logoUrl: string | null;
};

type Category = {
  id: string;
  name: string;
  createdAt: string;
  sources: Source[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load categories: ${response.status}`,
        );
      }

      const data = await response.json();

      setCategories(data.value ?? data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load categories',
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingCategory(null);
    setName('');
    setError('');
    setMessage('');
    setShowForm(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setError('');
    setMessage('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
    setName('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }

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

      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const method = editingCategory
        ? 'PATCH'
        : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage =
          `Request failed: ${response.status}`;

        try {
          const parsed = JSON.parse(responseText);

          if (Array.isArray(parsed.message)) {
            errorMessage =
              parsed.message.join(', ');
          } else if (parsed.message) {
            errorMessage = parsed.message;
          }
        } catch (_) {}

        throw new Error(errorMessage);
      }

      setMessage(
        editingCategory
          ? 'Category updated successfully.'
          : 'Category created successfully.',
      );

      closeForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save category',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    category: Category,
  ) {
    if (category.sources.length > 0) {
      setError(
        `Cannot delete "${category.name}" because it has ${category.sources.length} source(s). Move or remove those sources first.`,
      );
      setMessage('');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

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
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage =
          `Delete failed: ${response.status}`;

        try {
          const parsed = JSON.parse(responseText);

          if (parsed.message) {
            errorMessage = Array.isArray(
              parsed.message,
            )
              ? parsed.message.join(', ')
              : parsed.message;
          }
        } catch (_) {}

        throw new Error(errorMessage);
      }

      setMessage(
        'Category deleted successfully.',
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete category',
      );
    }
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
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage news categories.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add Category
          </button>
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
                  {editingCategory
                    ? 'Edit Category'
                    : 'Add Category'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the category name.
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
              className="flex flex-col gap-4 sm:flex-row"
            >
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Category name"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                autoFocus
              />

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Categories
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {categories.length} categories
              </p>
            </div>

            <button
              onClick={loadCategories}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-gray-200 p-5 transition hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {category.sources.length}{' '}
                        {category.sources.length === 1
                          ? 'source'
                          : 'sources'}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      Category
                    </span>
                  </div>

                  {category.sources.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Sources
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {category.sources.map(
                          (source) => (
                            <div
                              key={source.id}
                              className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700"
                            >
                              {source.logoUrl ? (
                                <img
                                  src={source.logoUrl}
                                  alt=""
                                  className="h-5 w-5 rounded-full object-contain"
                                />
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px]">
                                  N
                                </div>
                              )}

                              {source.name}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() =>
                        openEditForm(category)
                      }
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category)
                      }
                      className={`rounded-lg border px-4 py-2 text-xs font-semibold ${
                        category.sources.length > 0
                          ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
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



