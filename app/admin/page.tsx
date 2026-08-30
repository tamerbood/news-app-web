'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  role: string;
};

type Article = {
  id: string;
  title: string;
  publishedAt: string | null;
  source?: {
    name: string;
  } | null;
};

type Source = {
  id: string;
  name: string;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
};
type YouTubeChannel = {
  id: string;
  channelId: string;
  name: string;
  handle: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
};

type SportsLeague = {
  id: string;
  externalId: number;
  season: number;
  name: string;
  isActive: boolean;
};

type LiveChannel = {
  id: string;
  name: string;
  logoUrl: string | null;
  streamUrl: string;
  isActive: boolean;
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sportsLeagues, setSportsLeagues] = useState<SportsLeague[]>([]);
const [youtubeChannels, setYouTubeChannels] =
  useState<YouTubeChannel[]>([])
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token =
          localStorage.getItem('admin_token');

        if (!token) {
          window.location.href =
            '/admin/login';
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          userResponse,
          articlesResponse,
          sourcesResponse,
          categoriesResponse,
          usersResponse,
          youtubeChannelsResponse,
          sportsLeaguesResponse,
          liveChannelsResponse,
        ] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
            { headers },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/articles`,
            { headers },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sources`,
            { headers },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories`,
            { headers },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users`,
            { headers },
          ),
          fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/youtube/managed-channels`,
  { headers },
),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sports/admin/leagues`,
            { headers },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/live-channels`,
            { headers },
          ),
        ]);

        if (!userResponse.ok) {
          localStorage.removeItem(
            'admin_token',
          );

          localStorage.removeItem(
            'admin_user',
          );

          window.location.href =
            '/admin/login';

          return;
        }

        const currentUser =
          await userResponse.json();

        if (currentUser.role !== 'ADMIN') {
          localStorage.removeItem(
            'admin_token',
          );

          localStorage.removeItem(
            'admin_user',
          );

          window.location.href =
            '/admin/login';

          return;
        }

        if (
          !articlesResponse.ok ||
          !sourcesResponse.ok ||
          !categoriesResponse.ok ||
          !usersResponse.ok ||
          !youtubeChannelsResponse.ok ||
          !sportsLeaguesResponse.ok ||
          !liveChannelsResponse.ok
        ) {
          throw new Error(
            'Failed to load dashboard data',
          );
        }

        const articlesData =
          await articlesResponse.json();

        const sourcesData =
          await sourcesResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        const usersData =
          await usersResponse.json();
const youtubeChannelsData =
  await youtubeChannelsResponse.json();

        const sportsLeaguesData =
          await sportsLeaguesResponse.json();

        const liveChannelsData =
          await liveChannelsResponse.json();
        setUser(currentUser);

        setArticles(
          Array.isArray(articlesData)
            ? articlesData
            : articlesData.items ??
              articlesData.value ??
              [],
        );

        setSources(
          Array.isArray(sourcesData)
            ? sourcesData
            : sourcesData.items ??
              sourcesData.value ??
              [],
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.items ??
              categoriesData.value ??
              [],
        );

        setUsers(
          Array.isArray(usersData)
            ? usersData
            : usersData.items ??
              usersData.value ??
              [],
        );
        setYouTubeChannels(
  Array.isArray(youtubeChannelsData)
    ? youtubeChannelsData
    : youtubeChannelsData.items ??
      youtubeChannelsData.value ??
      [],
);

        setSportsLeagues(
          Array.isArray(sportsLeaguesData)
            ? sportsLeaguesData
            : sportsLeaguesData.items ??
              sportsLeaguesData.value ??
              [],
        );

        setLiveChannels(
          Array.isArray(liveChannelsData)
            ? liveChannelsData
            : liveChannelsData.items ??
              liveChannelsData.value ??
              [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard',
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem(
      'admin_token',
    );

    localStorage.removeItem(
      'admin_user',
    );

    window.location.href =
      '/admin/login';
  }

  const activeSources =
    sources.filter(
      (source) => source.isActive,
    ).length;

  const inactiveSources =
    sources.length - activeSources;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold text-red-600">
            Dashboard Error
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Mada Alalam
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.email}
              </p>

              <p className="text-xs font-medium text-green-600">
                {user?.role}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your news platform from here.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
<DashboardCard
  title="YouTube"
  value={youtubeChannels.length}
  description="YouTube Shorts channels"
  href="/admin/youtube"
/>

          <DashboardCard
            title="Sports"
            value={sportsLeagues.filter((league) => league.isActive).length}
            description="Active sports leagues"
            href="/admin/sports"
          />

          <DashboardCard
            title="Live Channels"
            value={liveChannels.filter((channel) => channel.isActive).length}
            description="Active live channels"
            href="/admin/live-channels"
          />



<DashboardCard
  title="Sources"
  value={sources.length}
  description="RSS news sources"
  href="/admin/sources"
/>

          <DashboardCard
            title="Categories"
            value={categories.length}
            description="News categories"
            href="/admin/categories"
          />

          <DashboardCard
            title="Users"
            value={users.length}
            description="Registered users"
            href="/admin/users"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Sources
                </h2>

                <p className="text-sm text-gray-500">
                  Manage RSS sources
                </p>
              </div>

              <button
                onClick={() =>
                  (window.location.href =
                    '/admin/sources')
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage →
              </button>
            </div>

            <div className="mb-5 flex gap-3">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                {activeSources} active
              </span>

              {inactiveSources > 0 && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  {inactiveSources} inactive
                </span>
              )}
            </div>

            <div className="space-y-3">
              {sources
                .slice(0, 5)
                .map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                  >
                    <span className="font-medium text-gray-900">
                      {source.name}
                    </span>

                    <span
                      className={
                        source.isActive
                          ? 'text-xs font-semibold text-green-600'
                          : 'text-xs font-semibold text-gray-400'
                      }
                    >
                      {source.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>
                ))}

              {sources.length === 0 && (
                <p className="py-5 text-sm text-gray-500">
                  No sources available.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Latest Articles
                </h2>

                <p className="text-sm text-gray-500">
                  Recently available news
                </p>
              </div>

              <button
                onClick={() =>
                  (window.location.href =
                    '/admin/articles')
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-4">
              {articles
                .slice(0, 5)
                .map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <h3 className="font-semibold leading-5 text-gray-900">
                      {article.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {article.source?.name ??
                        'Unknown source'}
                    </p>

                    {article.publishedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(
                          article.publishedAt,
                        )}
                      </p>
                    )}
                  </div>
                ))}

              {articles.length === 0 && (
                <p className="py-5 text-sm text-gray-500">
                  No articles available.
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Quick Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Quickly access all administration sections.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <QuickLink
                label="Articles"
                href="/admin/articles"
              />
<QuickLink
  label="YouTube Channels"
  href="/admin/youtube"
/>
              <QuickLink
                label="Live Channels"
                href="/admin/live-channels"
              />
              <QuickLink
                label="Sports Leagues"
                href="/admin/sports"
              />
              <QuickLink
                label="Sources"
                href="/admin/sources"
              />

              <QuickLink
                label="Categories"
                href="/admin/categories"
              />

              <QuickLink
                label="Users"
                href="/admin/users"
              />

              <QuickLink
                label="Stories"
                href="/admin/stories"
              />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <button
      onClick={() =>
        (window.location.href = href)
      }
      className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-semibold text-blue-600">
        Manage →
      </p>
    </button>
  );
}

function QuickLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <button
      onClick={() =>
        (window.location.href = href)
      }
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
