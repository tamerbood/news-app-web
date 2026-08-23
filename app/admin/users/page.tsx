'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type UserRole = 'USER' | 'ADMIN';

type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  _count: {
    sources: number;
    bookmarks: number;
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [selectedRole, setSelectedRole] =
    useState<UserRole>('USER');

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  async function loadCurrentUser() {
    try {
      const token =
        localStorage.getItem('admin_token');

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        window.location.href = '/admin/login';
        return;
      }

      const user = await response.json();

      setCurrentUserId(user.id);
    } catch (_) {
      window.location.href = '/admin/login';
    }
  }

  async function loadUsers() {
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
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Failed to load users: ${response.status} ${body}`,
        );
      }

      const data = await response.json();

      setUsers(data.value ?? data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load users',
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) =>
      user.email
        .toLowerCase()
        .includes(value),
    );
  }, [users, search]);

  function openRoleEditor(user: User) {
    if (user.id === currentUserId) {
      setError(
        'You cannot change your own admin role.',
      );
      setMessage('');
      return;
    }

    setEditingUser(user);
    setSelectedRole(user.role);
    setError('');
    setMessage('');
  }

  function closeRoleEditor() {
    if (saving) {
      return;
    }

    setEditingUser(null);
    setSelectedRole('USER');
  }

  async function updateRole(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingUser) {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: selectedRole,
          }),
        },
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        let errorMessage =
          `Request failed: ${response.status}`;

        try {
          const parsed =
            JSON.parse(responseText);

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
        `Role for ${editingUser.email} updated successfully.`,
      );

      closeRoleEditor();

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update user role',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: User) {
    if (user.id === currentUserId) {
      setError(
        'You cannot delete your own account from the admin panel.',
      );
      setMessage('');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete this user?\n\n${user.email}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        let errorMessage =
          `Delete failed: ${response.status}`;

        try {
          const parsed =
            JSON.parse(responseText);

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
        'User deleted successfully.',
      );

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete user',
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
              Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage registered users and their roles.
            </p>
          </div>

          <div className="rounded-xl bg-gray-100 px-4 py-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {users.length}
            </div>

            <div className="text-xs font-medium text-gray-500">
              Total Users
            </div>
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

        {editingUser && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Change User Role
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingUser.email}
              </p>
            </div>

            <form
              onSubmit={updateRole}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(
                      event.target
                        .value as UserRole,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="USER">
                    USER
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Role'}
              </button>

              <button
                type="button"
                onClick={closeRoleEditor}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Users
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by email..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              All Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredUsers.length} of{' '}
              {users.length} users
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isCurrentUser =
                  user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-600">
                        {user.email
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-900">
                            {user.email}
                          </h3>

                          {isCurrentUser && (
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          Joined{' '}
                          {formatDate(
                            user.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role}
                      </span>

                      <span className="text-xs text-gray-500">
                        {user._count.bookmarks}{' '}
                        bookmarks
                      </span>

                      <span className="text-xs text-gray-500">
                        {user._count.sources}{' '}
                        followed sources
                      </span>

                      <button
                        onClick={() =>
                          openRoleEditor(user)
                        }
                        disabled={isCurrentUser}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        Change Role
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(user)
                        }
                        disabled={isCurrentUser}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}



