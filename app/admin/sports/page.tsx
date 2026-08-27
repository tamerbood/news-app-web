'use client';

import { useEffect, useMemo, useState } from 'react';

type League = {
  id: string;
  externalId: number;
  season: number;
  name: string;
  country: string | null;
  logoUrl: string | null;
  flagUrl: string | null;
  isActive: boolean;
};

type ProviderLeague = {
  externalId: number;
  name: string;
  type: string;
  country: string | null;
  countryCode: string | null;
  logoUrl: string | null;
  flagUrl: string | null;
  season: number;
  current: boolean;
  standings: boolean;
};

export default function SportsAdminPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [providerLeagues, setProviderLeagues] = useState<ProviderLeague[]>([]);
  const [providerSearch, setProviderSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    void loadLeagues();
  }, []);

  function authHeaders() {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      window.location.href = '/admin/login';
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadLeagues() {
    try {
      setLoading(true);
      setError('');

      const headers = authHeaders();
      if (!headers) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sports/admin/leagues`,
        {
          headers,
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load leagues: ${response.status}`);
      }

      const data = await response.json();

      setLeagues(
        Array.isArray(data)
          ? data
          : data.items ?? data.value ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load sports leagues',
      );
    } finally {
      setLoading(false);
    }
  }

  async function openAddModal() {
    setShowAddModal(true);
    setProviderSearch('');
    setMessage('');
    setError('');

    if (providerLeagues.length > 0) return;

    try {
      setProviderLoading(true);

      const headers = authHeaders();
      if (!headers) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sports/admin/provider-leagues`,
        {
          headers,
          cache: 'no-store',
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Failed to load provider leagues: ${response.status}`,
        );
      }

      setProviderLeagues(
        Array.isArray(data)
          ? data
          : data.items ?? data.value ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load available leagues',
      );
    } finally {
      setProviderLoading(false);
    }
  }

  async function addLeague(league: ProviderLeague) {
    if (addingId !== null) return;

    const alreadyAdded = leagues.some(
      (item) => item.externalId === league.externalId,
    );

    if (alreadyAdded) return;

    try {
      setAddingId(league.externalId);
      setError('');
      setMessage('');

      const headers = authHeaders();
      if (!headers) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sports/admin/leagues`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalId: league.externalId,
            season: league.season,
            name: league.name,
            country: league.country,
            logoUrl: league.logoUrl,
            flagUrl: league.flagUrl,
            isActive: true,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? `Failed to add league: ${response.status}`,
        );
      }

      setMessage(`${league.name} was added and activated.`);
      await loadLeagues();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add league',
      );
    } finally {
      setAddingId(null);
    }
  }

  async function toggleLeague(league: League) {
    try {
      setError('');
      setMessage('');

      const headers = authHeaders();
      if (!headers) return;

      const nextActive = !league.isActive;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sports/admin/leagues/${league.externalId}/active`,
        {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: nextActive,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? `Update failed: ${response.status}`,
        );
      }

      setMessage(
        `${league.name} is now ${
          nextActive ? 'active' : 'inactive'
        }.`,
      );

      await loadLeagues();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update league',
      );
    }
  }

  const filteredProviderLeagues = useMemo(() => {
    const query = providerSearch.trim().toLowerCase();

    if (!query) {
      return providerLeagues;
    }

    return providerLeagues.filter((league) =>
      [
        league.name,
        league.country,
        league.countryCode,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [providerLeagues, providerSearch]);

  const activeCount = leagues.filter(
    (league) => league.isActive,
  ).length;

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
              Sports Leagues
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Choose the leagues you want to show and synchronize in the app.
            </p>
          </div>

          <button
            onClick={() => void openAddModal()}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add League
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

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active leagues
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              All leagues
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {leagues.length}
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              Leagues
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Disable a league to hide it from the mobile app and exclude it
              from sports synchronization.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading leagues...
            </div>
          ) : leagues.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No sports leagues found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leagues.map((league) => (
                <div
                  key={league.externalId}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-gray-50 p-2">
                      {league.logoUrl ? (
                        <img
                          src={league.logoUrl}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">⚽</span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {league.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {league.country ?? '—'} · External ID{' '}
                        {league.externalId} · Season {league.season}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => void toggleLeague(league)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      league.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {league.isActive
                      ? '● Active'
                      : '○ Inactive'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <section className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Sports League
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    These leagues come directly from API-Football. You do not
                    need to enter IDs or logo URLs manually.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-5">
                <input
                  value={providerSearch}
                  onChange={(event) =>
                    setProviderSearch(event.target.value)
                  }
                  placeholder="Search by league or country..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4">
              {providerLoading ? (
                <div className="p-10 text-center text-sm text-gray-500">
                  Loading available leagues...
                </div>
              ) : filteredProviderLeagues.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">
                  No matching leagues found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredProviderLeagues.map((league) => {
                    const alreadyAdded = leagues.some(
                      (item) =>
                        item.externalId === league.externalId,
                    );

                    return (
                      <div
                        key={league.externalId}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 p-2">
                          {league.logoUrl ? (
                            <img
                              src={league.logoUrl}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span>⚽</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-gray-900">
                            {league.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {league.country ?? '—'} · Season{' '}
                            {league.season}
                          </p>
                        </div>

                        {alreadyAdded ? (
                          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500">
                            Added
                          </span>
                        ) : (
                          <button
                            onClick={() => void addLeague(league)}
                            disabled={addingId !== null}
                            className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            {addingId === league.externalId
                              ? 'Adding...'
                              : 'Add'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                The provider list is cached by the backend for several hours,
                so searching here does not create an API request for every
                keystroke.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
