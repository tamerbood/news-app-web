'use client';

import AdminShell from '../components/AdminShell';

import { FormEvent, useEffect, useState } from 'react';

type Country = {
  id: string;
  name: string;
  nameEn: string;
  code: string;
};

type StreamType = 'HLS' | 'YOUTUBE';

type LiveChannel = {
  id: string;
  name: string;
  logoUrl: string | null;
  streamUrl: string;
  streamType?: StreamType | null;
  countryId: string | null;
  country?: Country | null;
  category: 'NEWS' | 'SPORTS' | 'ENTERTAINMENT';
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  logoUrl: string;
  streamUrl: string;
  streamType: StreamType;
  countryId: string;
  category: LiveChannel['category'];
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: FormState = {
  name: '',
  logoUrl: '',
  streamUrl: '',
  streamType: 'HLS',
  countryId: '',
  category: 'NEWS',
  isActive: true,
  sortOrder: '0',
};

function isValidYouTubeUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    return (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'youtube-nocookie.com'
    );
  } catch {
    return false;
  }
}

function getStreamTypeLabel(type?: StreamType | null) {
  return type === 'YOUTUBE' ? 'YouTube' : 'HLS';
}

export default function LiveChannelsPage() {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<LiveChannel | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      window.location.href = '/admin/login';
      throw new Error('Not authenticated');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  async function load() {
    try {
      setLoading(true);
      setError('');

      const [countriesResponse, channelsResponse] = await Promise.all([
        authFetch(`${process.env.NEXT_PUBLIC_API_URL}/countries`),
        authFetch(`${process.env.NEXT_PUBLIC_API_URL}/live-channels/admin`),
      ]);

      if (!countriesResponse.ok || !channelsResponse.ok) {
        throw new Error('Failed to load live channels');
      }

      const countriesData = await countriesResponse.json();
      const channelsData = await channelsResponse.json();

      setCountries(
        Array.isArray(countriesData)
          ? countriesData
          : countriesData.value ?? [],
      );

      setChannels(
        Array.isArray(channelsData)
          ? channelsData
          : channelsData.value ?? [],
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load live channels',
      );
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError('');
    setMessage('');
    setShowForm(true);
  }

  function openEdit(channel: LiveChannel) {
    setEditing(channel);

    setForm({
      name: channel.name,
      logoUrl: channel.logoUrl ?? '',
      streamUrl: channel.streamUrl,
      // Existing channels created before this field was introduced remain HLS.
      streamType: channel.streamType === 'YOUTUBE' ? 'YOUTUBE' : 'HLS',
      countryId: channel.countryId ?? '',
      category: channel.category,
      isActive: channel.isActive,
      sortOrder: String(channel.sortOrder),
    });

    setError('');
    setMessage('');
    setShowForm(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const streamUrl = form.streamUrl.trim();

    if (!name || !streamUrl) {
      setError('اسم القناة ورابط البث مطلوبان.');
      return;
    }

    if (form.streamType === 'YOUTUBE' && !isValidYouTubeUrl(streamUrl)) {
      setError(
        'عند اختيار YouTube يجب إدخال رابط YouTube صالح، مثل https://www.youtube.com/live/...',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const payload = {
        name,
        logoUrl: form.logoUrl.trim() || null,
        streamUrl,
        streamType: form.streamType,
        countryId: form.countryId || null,
        category: form.category,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const response = await authFetch(
        editing
          ? `${process.env.NEXT_PUBLIC_API_URL}/live-channels/${editing.id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/live-channels`,
        {
          method: editing ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `Request failed: ${response.status}`);
      }

      setShowForm(false);
      setMessage(editing ? 'تم تحديث القناة.' : 'تمت إضافة القناة.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save channel');
    } finally {
      setSaving(false);
    }
  }

  async function remove(channel: LiveChannel) {
    if (!window.confirm(`حذف قناة ${channel.name}؟`)) return;

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/live-channels/${channel.id}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to delete channel',
      );
    }
  }

  async function toggle(channel: LiveChannel) {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/live-channels/${channel.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isActive: !channel.isActive }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update channel');
      }

      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to update channel',
      );
    }
  }

  return (
    <AdminShell title="Live Channels">
    <main className="min-h-screen bg-gray-100" dir="rtl">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => (window.location.href = '/admin')}
              className="text-sm font-semibold text-blue-600"
            >
              ← لوحة التحكم
            </button>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              البث المباشر
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              إدارة قنوات البث المباشر. يدعم HLS و YouTube.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            + إضافة قناة
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
              <h2 className="text-xl font-bold">
                {editing ? 'تعديل قناة' : 'إضافة قناة'}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="اسم القناة"
                className="rounded-lg border px-4 py-3"
              />

              <input
                value={form.logoUrl}
                onChange={(e) =>
                  setForm({ ...form, logoUrl: e.target.value })
                }
                placeholder="رابط الشعار"
                className="rounded-lg border px-4 py-3"
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  نوع البث
                </label>

                <select
                  value={form.streamType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      streamType: e.target.value as StreamType,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-3"
                >
                  <option value="HLS">HLS / M3U8</option>
                  <option value="YOUTUBE">YouTube Live</option>
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  HLS يستخدم المشغل الحالي. YouTube يستخدم مشغل YouTube
                  المدمج في التطبيق.
                </p>
              </div>

              <div className="md:col-span-2">
                <input
                  required
                  value={form.streamUrl}
                  onChange={(e) =>
                    setForm({ ...form, streamUrl: e.target.value })
                  }
                  placeholder={
                    form.streamType === 'YOUTUBE'
                      ? 'رابط YouTube Live الرسمي'
                      : 'رابط HLS / M3U8'
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />

                {form.streamType === 'YOUTUBE' && (
                  <p className="mt-2 text-xs text-gray-500">
                    مثال: https://www.youtube.com/live/XXXXXXXX أو
                    https://www.youtube.com/watch?v=XXXXXXXX
                  </p>
                )}
              </div>

              <select
                value={form.countryId}
                onChange={(e) =>
                  setForm({ ...form, countryId: e.target.value })
                }
                className="rounded-lg border px-4 py-3"
              >
                <option value="">بدون دولة</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} ({country.nameEn})
                  </option>
                ))}
              </select>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as FormState['category'],
                  })
                }
                className="rounded-lg border px-4 py-3"
              >
                <option value="NEWS">أخبار</option>
                <option value="SPORTS">رياضة</option>
                <option value="ENTERTAINMENT">منوعات</option>
              </select>

              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
                placeholder="الترتيب"
                className="rounded-lg border px-4 py-3"
              />

              <label className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <span>القناة مفعلة</span>
              </label>

              <button
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white md:col-span-2 disabled:opacity-50"
              >
                {saving
                  ? 'جارٍ الحفظ...'
                  : editing
                    ? 'حفظ التعديلات'
                    : 'إضافة القناة'}
              </button>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">جميع القنوات</h2>
              <p className="mt-1 text-sm text-gray-500">
                {channels.length} قناة
              </p>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              تحديث
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              جارٍ التحميل...
            </div>
          ) : channels.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              لا توجد قنوات.
            </div>
          ) : (
            <div className="divide-y">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex flex-wrap items-center gap-4 p-5"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                    {channel.logoUrl ? (
                      <img
                        src={channel.logoUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">📺</span>
                    )}
                  </div>

                  <div className="min-w-48 flex-1">
                    <h3 className="font-bold">{channel.name}</h3>

                    <p className="text-sm text-gray-500">
                      {channel.country?.name ?? 'بدون دولة'} ·{' '}
                      {channel.category === 'NEWS'
                        ? 'أخبار'
                        : channel.category === 'SPORTS'
                          ? 'رياضة'
                          : 'منوعات'}{' '}
                      · ترتيب {channel.sortOrder}
                    </p>
                  </div>

                  <span
                    className={
                      channel.streamType === 'YOUTUBE'
                        ? 'rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700'
                        : 'rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'
                    }
                  >
                    {getStreamTypeLabel(channel.streamType)}
                  </span>

                  <span
                    className={
                      channel.isActive
                        ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'
                        : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500'
                    }
                  >
                    {channel.isActive ? 'مفعلة' : 'متوقفة'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle(channel)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      {channel.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>

                    <button
                      onClick={() => openEdit(channel)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => remove(channel)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
    </AdminShell>
  );
}
