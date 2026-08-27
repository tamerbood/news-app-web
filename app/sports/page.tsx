'use client';

import { useEffect, useMemo, useState } from 'react';

type Team = { name?: string; logoUrl?: string };
type League = { name?: string; logoUrl?: string; country?: string };
type Match = {
  id: string;
  kickoffAt: string;
  status: string;
  statusLong?: string;
  elapsedMinute?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: Team;
  awayTeam?: Team;
  league?: League;
};

export default function SportsPage() {
  const [tab, setTab] = useState<'today' | 'live' | 'tomorrow'>('today');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const date = useMemo(() => {
    const value = new Date();
    if (tab === 'tomorrow') value.setDate(value.getDate() + 1);
    return value.toISOString().slice(0, 10);
  }, [tab]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not configured.');
        const url = tab === 'live'
          ? `${apiUrl}/sports/live`
          : `${apiUrl}/sports/matches?date=${date}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to load sports data (${response.status})`);
        const data = await response.json();
        if (!cancelled) setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setMatches([]);
          setError(err instanceof Error ? err.message : 'Failed to load sports data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [apiUrl, tab, date]);

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الرياضة</h1>
            <p className="mt-2 text-gray-500">المباريات والنتائج المباشرة من مصدر رياضي موحد.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>

        <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm">
          {[
            ['today', 'اليوم'],
            ['live', 'مباشر'],
            ['tomorrow', 'غدًا'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as typeof tab)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${tab === value ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">جارٍ تحميل المباريات...</div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">⚽</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">لا توجد مباريات</h2>
            <p className="mt-2 text-sm text-gray-500">ستظهر المباريات هنا بعد مزامنة مصدر البيانات الرياضي.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MatchCard({ match }: { match: Match }) {
  const live = ['1H', 'HT', '2H', 'ET', 'P', 'BT'].includes(match.status);
  const time = new Date(match.kickoffAt).toLocaleTimeString('ar-JO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const status = live
    ? `مباشر${match.elapsedMinute ? ` ${match.elapsedMinute}'` : ''}`
    : ['FT', 'AET', 'PEN'].includes(match.status)
      ? 'انتهت'
      : match.status === 'NS'
        ? time
        : match.statusLong ?? match.status;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
        {match.league?.logoUrl && <img src={match.league.logoUrl} alt="" className="h-5 w-5 object-contain" />}
        <span>{match.league?.name}</span>
        <span className={`mr-auto ${live ? 'text-red-600' : 'text-gray-400'}`}>{status}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <Team team={match.homeTeam} align="right" />
        <div className="text-center">
          <div className="text-xl font-black text-gray-900">
            {match.homeScore == null && match.awayScore == null
              ? 'VS'
              : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
          </div>
          <div className="mt-1 text-[11px] text-gray-400">{time}</div>
        </div>
        <Team team={match.awayTeam} align="left" />
      </div>
    </article>
  );
}

function Team({ team, align }: { team?: Team; align: 'right' | 'left' }) {
  return (
    <div className={`flex items-center gap-3 ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
      <span className="font-bold text-gray-800">{team?.name}</span>
      {team?.logoUrl ? <img src={team.logoUrl} alt="" className="h-10 w-10 object-contain" /> : <span className="text-2xl">🛡️</span>}
    </div>
  );
}
