'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type User = {
  id: string;
  email: string;
  role: string;
};

type Article = {
  id: string;
  title: string;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
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
  name: string;
  isActive: boolean;
};

type SportsLeague = {
  id: string;
  name: string;
  isActive: boolean;
};

type LiveChannel = {
  id: string;
  name: string;
  isActive: boolean;
};

type Story = {
  id: string;
  title?: string | null;
  isActive?: boolean;
};

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

type IconName =
  | 'grid'
  | 'article'
  | 'stories'
  | 'source'
  | 'category'
  | 'youtube'
  | 'live'
  | 'sports'
  | 'users'
  | 'settings'
  | 'search'
  | 'bell'
  | 'logout'
  | 'arrow'
  | 'external'
  | 'database'
  | 'check'
  | 'plus';

const navigation: { title: string; items: NavItem[] }[] = [
  {
    title: 'Workspace',
    items: [{ label: 'Dashboard', href: '/admin', icon: 'grid' }],
  },
  {
    title: 'Content',
    items: [
      { label: 'Articles', href: '/admin/articles', icon: 'article' },
      { label: 'Stories', href: '/admin/stories', icon: 'stories' },
      { label: 'Sources', href: '/admin/sources', icon: 'source' },
      { label: 'Categories', href: '/admin/categories', icon: 'category' },
    ],
  },
  {
    title: 'Media & Sports',
    items: [
      { label: 'YouTube', href: '/admin/youtube', icon: 'youtube' },
      { label: 'Live Channels', href: '/admin/live-channels', icon: 'live' },
      { label: 'Sports', href: '/admin/sports', icon: 'sports' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'users' },
      { label: 'Settings', href: '/admin', icon: 'settings' },
    ],
  },
];

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === 'object') {
    const value = data as {
      items?: unknown;
      value?: unknown;
    };

    if (Array.isArray(value.items)) return value.items as T[];
    if (Array.isArray(value.value)) return value.value as T[];
  }

  return [];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [youtubeChannels, setYouTubeChannels] = useState<YouTubeChannel[]>([]);
  const [sportsLeagues, setSportsLeagues] = useState<SportsLeague[]>([]);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  async function loadDashboard() {
    if (!apiUrl) {
      setError('NEXT_PUBLIC_API_URL is not configured.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');

    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      setError('');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        userResponse,
        articlesResponse,
        sourcesResponse,
        categoriesResponse,
        usersResponse,
        youtubeResponse,
        sportsResponse,
        liveResponse,
        storiesResponse,
      ] = await Promise.all([
        fetch(`${apiUrl}/auth/me`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/articles`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/sources`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/categories`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/users`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/youtube/managed-channels`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/sports/admin/leagues`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/live-channels`, { headers, cache: 'no-store' }),
        fetch(`${apiUrl}/stories/admin/all`, { headers, cache: 'no-store' }),
      ]);

      if (!userResponse.ok) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return;
      }

      const currentUser = (await userResponse.json()) as User;

      if (currentUser.role !== 'ADMIN') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return;
      }

      if (
        !articlesResponse.ok ||
        !sourcesResponse.ok ||
        !categoriesResponse.ok ||
        !usersResponse.ok ||
        !youtubeResponse.ok ||
        !sportsResponse.ok ||
        !liveResponse.ok ||
        !storiesResponse.ok
      ) {
        throw new Error('Failed to load dashboard data.');
      }

      const [
        articlesData,
        sourcesData,
        categoriesData,
        usersData,
        youtubeData,
        sportsData,
        liveData,
        storiesData,
      ] = await Promise.all([
        articlesResponse.json(),
        sourcesResponse.json(),
        categoriesResponse.json(),
        usersResponse.json(),
        youtubeResponse.json(),
        sportsResponse.json(),
        liveResponse.json(),
        storiesResponse.json(),
      ]);

      setUser(currentUser);
      setArticles(extractArray<Article>(articlesData));
      setSources(extractArray<Source>(sourcesData));
      setCategories(extractArray<Category>(categoriesData));
      setUsers(extractArray<User>(usersData));
      setYouTubeChannels(extractArray<YouTubeChannel>(youtubeData));
      setSportsLeagues(extractArray<SportsLeague>(sportsData));
      setLiveChannels(extractArray<LiveChannel>(liveData));
      setStories(extractArray<Story>(storiesData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  }

  const activeSources = sources.filter((source) => source.isActive).length;
  const activeLeagues = sportsLeagues.filter((league) => league.isActive).length;
  const activeLiveChannels = liveChannels.filter((channel) => channel.isActive).length;
  const activeYouTube = youtubeChannels.filter((channel) => channel.isActive).length;

  const recentArticles = useMemo(
    () =>
      [...articles]
        .sort((a, b) => {
          const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 6),
    [articles],
  );

  const sourceBreakdown = useMemo(() => {
    const total = Math.max(sources.length, 1);
    return [
      { label: 'Active sources', value: activeSources, percent: Math.round((activeSources / total) * 100) },
      { label: 'Inactive sources', value: sources.length - activeSources, percent: Math.round(((sources.length - activeSources) / total) * 100) },
    ];
  }, [sources.length, activeSources]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-6 lg:p-8">
        <div className="mx-auto flex min-h-[80vh] max-w-[1600px] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
            <span className="text-sm font-medium text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Icon name="database" size={22} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-950">Dashboard Error</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-[#101820] text-white lg:flex">
        <div className="flex h-[76px] items-center border-b border-white/8 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-950">
              <span className="text-lg font-black">M</span>
            </div>
            <div>
              <p className="text-[17px] font-extrabold tracking-tight">MADA ALALAM</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">
                News Control
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = item.href === '/admin';

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                        active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                          : 'text-gray-400 hover:bg-white/6 hover:text-white'
                      }`}
                    >
                      <Icon name={item.icon} size={17} />
                      <span>{item.label}</span>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
              {user?.email?.slice(0, 1).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.email ?? 'Admin'}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <Icon name="logout" size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200/80 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 sm:flex">
              <Icon name="grid" size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Workspace / Overview</p>
              <h1 className="text-lg font-bold tracking-tight text-gray-950">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 md:flex">
              <Icon name="search" size={15} />
              <span>Search anything</span>
              <kbd className="ml-5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">⌘ K</kbd>
            </div>
            <button
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon name="bell" size={17} />
            </button>
            <div className="hidden h-10 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                {user?.email?.slice(0, 1).toUpperCase() ?? 'A'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[180px] truncate text-xs font-semibold">{user?.email}</p>
                <p className="text-[10px] font-medium text-blue-600">ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {navigation.flatMap((section) => section.items).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                  item.href === '/admin'
                    ? 'bg-gray-950 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8 lg:py-8">
          <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ALL SYSTEMS OPERATIONAL
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Good to see you, Admin.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your news platform, monitor content, and keep every publishing channel under control.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/articles"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                <Icon name="plus" size={16} />
                Add Article
              </Link>
              <Link
                href="/admin/sources"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
              >
                Manage Sources
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Articles" value={articles.length} hint="Published content" icon="article" href="/admin/articles" />
            <StatCard title="Active Sources" value={activeSources} hint={`${sources.length} sources configured`} icon="source" href="/admin/sources" />
            <StatCard title="Registered Users" value={users.length} hint="Platform accounts" icon="users" href="/admin/users" />
            <StatCard title="Stories" value={stories.length} hint="Story management" icon="stories" href="/admin/stories" accent />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <Panel
              title="Content activity"
              subtitle="Your latest articles and publishing activity"
              href="/admin/articles"
              action="View all"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Articles" value={articles.length} />
                <Metric label="Categories" value={categories.length} />
                <Metric label="Sources" value={sources.length} />
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
                {recentArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                      <Icon name="article" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{article.title}</p>
                      <p className="mt-1 truncate text-[11px] text-gray-400">
                        {article.source?.name ?? 'Unknown source'} · {formatDate(article.publishedAt)}
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 sm:inline-flex">
                      LIVE
                    </span>
                    <span className="text-xs font-semibold text-gray-300">0{index + 1}</span>
                  </div>
                ))}

                {recentArticles.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    No articles available.
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Platform health" subtitle="Live status of your main services">
              <div className="space-y-3">
                <HealthRow label="RSS Sources" value={`${activeSources}/${sources.length}`} active={activeSources > 0} icon="source" />
                <HealthRow label="YouTube Channels" value={`${activeYouTube}/${youtubeChannels.length}`} active={activeYouTube > 0} icon="youtube" />
                <HealthRow label="Live Channels" value={`${activeLiveChannels}/${liveChannels.length}`} active={activeLiveChannels > 0} icon="live" />
                <HealthRow label="Sports Leagues" value={`${activeLeagues}/${sportsLeagues.length}`} active={activeLeagues > 0} icon="sports" />
              </div>

              <div className="mt-5 rounded-2xl bg-gray-950 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Database content</p>
                    <p className="mt-1 text-2xl font-black">{articles.length.toLocaleString()}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon name="database" size={20} />
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(8, articles.length ? 68 : 8))}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-gray-500">Automatic cleanup keeps older content under control.</p>
              </div>
            </Panel>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <Panel title="Sources overview" subtitle="RSS collection status">
              <div className="space-y-4">
                {sourceBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-500">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/sources" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                Manage RSS sources <Icon name="arrow" size={13} />
              </Link>
            </Panel>

            <Panel title="Quick management" subtitle="Jump straight into administration">
              <div className="grid grid-cols-2 gap-2.5">
                <QuickAction label="Articles" href="/admin/articles" icon="article" />
                <QuickAction label="Stories" href="/admin/stories" icon="stories" />
                <QuickAction label="YouTube" href="/admin/youtube" icon="youtube" />
                <QuickAction label="Live Channels" href="/admin/live-channels" icon="live" />
                <QuickAction label="Sports" href="/admin/sports" icon="sports" />
                <QuickAction label="Users" href="/admin/users" icon="users" />
              </div>
            </Panel>

            <Panel title="System snapshot" subtitle="Current platform inventory">
              <div className="space-y-1">
                <Snapshot label="Articles" value={articles.length} />
                <Snapshot label="Sources" value={sources.length} />
                <Snapshot label="Categories" value={categories.length} />
                <Snapshot label="Users" value={users.length} />
                <Snapshot label="YouTube" value={youtubeChannels.length} />
                <Snapshot label="Sports leagues" value={sportsLeagues.length} />
                <Snapshot label="Stories" value={stories.length} />
              </div>
            </Panel>
          </section>

          <footer className="mt-8 flex flex-col gap-2 border-t border-gray-200 pt-5 text-[11px] text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Mada Alalam · Administration Console</p>
            <p>Secure admin workspace</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
  href,
  accent = false,
}: {
  title: string;
  value: number;
  hint: string;
  icon: IconName;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-700'}`}>
          <Icon name={icon} size={20} />
        </div>
        <Icon name="external" size={15} className="text-gray-300 transition group-hover:text-gray-500" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-gray-950">{value.toLocaleString()}</p>
      <p className="mt-1 text-[11px] text-gray-400">{hint}</p>
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  children,
  href,
  action,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  href?: string;
  action?: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-950">{title}</h3>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-700">
            {action ?? 'Open'} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-black text-gray-950">{value.toLocaleString()}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  active,
  icon,
}: {
  label: string;
  value: string;
  active: boolean;
  icon: IconName;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 px-3.5 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
        <Icon name={icon} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="mt-0.5 text-[10px] text-gray-400">{value} active</p>
      </div>
      <span className={`flex items-center gap-1.5 text-[10px] font-bold ${active ? 'text-green-600' : 'text-gray-400'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
        {active ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  );
}

function QuickAction({ label, href, icon }: { label: string; href: string; icon: IconName }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-700 transition hover:border-gray-200 hover:bg-white hover:shadow-sm"
    >
      <Icon name={icon} size={15} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Snapshot({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-black text-gray-900">{value.toLocaleString()}</span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'No publication date';

  try {
    return new Date(value).toLocaleString('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}

function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  switch (name) {
    case 'grid':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case 'article':
      return <svg {...common}><path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M14 3.5V7h4M8 11h6M8 15h6M8 18h4" /></svg>;
    case 'stories':
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2.5" /><circle cx="12" cy="9" r="2.5" /><path d="M8 17c.9-2 2.2-3 4-3s3.1 1 4 3" /></svg>;
    case 'source':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h10" /><circle cx="18" cy="17" r="2" /></svg>;
    case 'category':
      return <svg {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h4l2 2H17.5A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z" /></svg>;
    case 'youtube':
      return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></svg>;
    case 'live':
      return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M8 9v6M12 9v6M16 9v6" /></svg>;
    case 'sports':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="m9 4.5 1.5 4.5L7 12l3.5 3 1.5 4.5L15.5 15 19 12l-3.5-3L14 4.5 12 8Z" /></svg>;
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.6-3.1 2.4-4.7 5.5-4.7s4.9 1.6 5.5 4.7M16 11a3 3 0 1 0 0-6M16 14.3c2.5 0 4 1.5 4.5 4.7" /></svg>;
    case 'settings':
      return <svg {...common}><path d="m12 3 1 2.1 2.3.5 1.8-1.2 1.5 1.5-1.2 1.8.5 2.3 2.1 1v2l-2.1 1-.5 2.3 1.2 1.8-1.5 1.5-1.8-1.2-2.3.5L12 21l-1-2.1-2.3-.5-1.8 1.2-1.5-1.5 1.2-1.8-.5-2.3L4 13v-2l2.1-1 .5-2.3-1.2-1.8 1.5-1.5 1.8 1.2 2.3-.5L12 3Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
    case 'bell':
      return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>;
    case 'logout':
      return <svg {...common}><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 16l4-4-4-4M18 12H9" /></svg>;
    case 'arrow':
      return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
    case 'external':
      return <svg {...common}><path d="M14 5h5v5M19 5l-7 7" /><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" /></svg>;
    case 'database':
      return <svg {...common}><ellipse cx="12" cy="5.5" rx="7.5" ry="3" /><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" /></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    default:
      return null;
  }
}
