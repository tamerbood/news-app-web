'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type YouTubeChannel = {
  id: string;
  channelId: string;
  name: string;
  handle?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ChannelForm = {
  channelId: string;
  name: string;
  handle: string;
  thumbnailUrl: string;
  isActive: boolean;
};

const emptyForm: ChannelForm = {
  channelId: '',
  name: '',
  handle: '',
  thumbnailUrl: '',
  isActive: true,
};

export default function YouTubeAdminPage() {
  const [channels, setChannels] =
    useState<YouTubeChannel[]>([]);

  const [form, setForm] =
    useState<ChannelForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');
const [verifying, setVerifying] = useState(false);
const [syncingId, setSyncingId] = useState<string | null>(null);
const [syncingShortsId, setSyncingShortsId] = useState<string | null>(null);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  // =========================================================
  // LOAD CHANNELS
  // =========================================================

  async function loadChannels() {
    if (!apiUrl) {
      setError(
        'NEXT_PUBLIC_API_URL is not configured.',
      );
      setLoading(false);
      return;
    }

    try {
      setError('');

      const token =
        localStorage.getItem('admin_token')

      if (!token) {
        window.location.href =
          '/admin/login';
        return;
      }

      const response =
        await fetch(
          `${apiUrl}/youtube/managed-channels`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        );

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
        window.location.href =
          '/admin/login';
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load YouTube channels (${response.status})`,
        );
      }

      const data =
        await response.json();

      setChannels(
        Array.isArray(data)
          ? data
          : data.value ?? [],
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load channels.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChannels();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setSuccess('');
  }

  function updateForm(
    field: keyof ChannelForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(
    channel: YouTubeChannel,
  ) {
    setEditingId(channel.id);

    setForm({
      channelId:
        channel.channelId ?? '',
      name:
        channel.name ?? '',
      handle:
        channel.handle ?? '',
      thumbnailUrl:
        channel.thumbnailUrl ?? '',
      isActive:
        channel.isActive,
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
async function verifyChannel() {
  if (!apiUrl) {
    setError('NEXT_PUBLIC_API_URL is not configured.');
    return;
  }

  const channelId = form.channelId.trim();

  if (!channelId) {
    setError('YouTube Channel ID is required.');
    return;
  }

  const token = localStorage.getItem('admin_token');

  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  try {
    setVerifying(true);
    setError('');
    setSuccess('');

    const response = await fetch(
      `${apiUrl}/youtube/channels/${encodeURIComponent(channelId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      },
    );

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
      return;
    }

    if (!response.ok) {
      let message = 'Failed to verify YouTube channel.';

      try {
        const data = await response.json();

        if (Array.isArray(data.message)) {
          message = data.message.join(', ');
        } else if (typeof data.message === 'string') {
          message = data.message;
        }
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    const data = await response.json();

    setForm((current) => ({
      ...current,
      channelId: data.channelId ?? channelId,
      name: data.name ?? '',
      handle: data.handle ?? '',
      thumbnailUrl: data.thumbnailUrl ?? '',
    }));

    setSuccess('Channel verified successfully.');
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Failed to verify YouTube channel.',
    );
  } finally {
    setVerifying(false);
  }
}
async function syncChannel(channel: YouTubeChannel) {
  if (!apiUrl) return;

  const token = localStorage.getItem('admin_token');

  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  try {
    setError('');
    setSuccess('');
    setSyncingId(channel.id);

    const response = await fetch(
      `${apiUrl}/youtube/sync/${encodeURIComponent(channel.channelId)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
      return;
    }

    if (!response.ok) {
      let message = 'Failed to sync YouTube channel.';

      try {
        const data = await response.json();

        if (typeof data.message === 'string') {
          message = data.message;
        }
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    await loadChannels();

    setSuccess(`"${channel.name}" synced successfully.`);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Failed to sync YouTube channel.',
    );
  } finally {
    setSyncingId(null);
  }
}
async function syncShorts(channel: YouTubeChannel) {
  if (!apiUrl) return;

  const token = localStorage.getItem('admin_token');

  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  if (!channel.handle) {
    setError(
      `"${channel.name}" has no YouTube handle. Verify/update the channel first.`,
    );
    return;
  }

  try {
    setError('');
    setSuccess('');
    setSyncingShortsId(channel.id);

    const response = await fetch(
      `${apiUrl}/youtube/channels/${encodeURIComponent(
        channel.channelId,
      )}/shorts-sync`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
      return;
    }

    if (!response.ok) {
      let message = 'Failed to sync Shorts.';

      try {
        const data = await response.json();

        if (typeof data.message === 'string') {
          message = data.message;
        }
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    const data = await response.json();

    await loadChannels();

    const count =
      typeof data?.created === 'number'
        ? data.created
        : typeof data?.count === 'number'
          ? data.count
          : null;

    setSuccess(
      count !== null
        ? `"${channel.name}" Shorts synced successfully. ${count} new Shorts.`
        : `"${channel.name}" Shorts synced successfully.`,
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'Failed to sync Shorts.',
    );
  } finally {
    setSyncingShortsId(null);
  }
}

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!apiUrl) {
      setError(
        'NEXT_PUBLIC_API_URL is not configured.',
      );
      return;
    }

    const token =
      localStorage.getItem('admin_token')

    if (!token) {
      window.location.href =
        '/admin/login';
      return;
    }

    if (!form.channelId.trim()) {
      setError(
        'YouTube Channel ID is required.',
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        'Channel name is required.',
      );
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        channelId:
          form.channelId.trim(),

        name:
          form.name.trim(),

        handle:
          form.handle
            .trim()
            .replace(/^@/, ''),

        thumbnailUrl:
          form.thumbnailUrl.trim(),

        isActive:
          form.isActive,
      };

      const url = editingId
        ? `${apiUrl}/youtube/managed-channels/${editingId}`
        : `${apiUrl}/youtube/managed-channels`;

      const method =
        editingId ? 'PATCH' : 'POST';

      const response =
        await fetch(url, {
          method,
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body:
            JSON.stringify(payload),
        });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
        window.location.href =
          '/admin/login';
        return;
      }

      if (!response.ok) {
        let message =
          'Failed to save YouTube channel.';

        try {
          const data =
            await response.json();

          if (Array.isArray(data.message)) {
            message =
              data.message.join(', ');
          } else if (
            typeof data.message ===
            'string'
          ) {
            message =
              data.message;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      await loadChannels();

      setSuccess(
        editingId
          ? 'YouTube channel updated successfully.'
          : 'YouTube channel added successfully.',
      );

      resetForm();

      setSuccess(
        editingId
          ? 'YouTube channel updated successfully.'
          : 'YouTube channel added successfully.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save YouTube channel.',
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function deleteChannel(
    channel: YouTubeChannel,
  ) {
    if (!apiUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${channel.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem('admin_token')

    if (!token) {
      window.location.href =
        '/admin/login';
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response =
        await fetch(
          `${apiUrl}/youtube/managed-channels/${channel.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
        window.location.href =
          '/admin/login';
        return;
      }

      if (!response.ok) {
        let message =
          'Failed to delete channel.';

        try {
          const data =
            await response.json();

          if (
            typeof data.message ===
            'string'
          ) {
            message =
              data.message;
          }
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      await loadChannels();

      setSuccess(
        'YouTube channel deleted successfully.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to delete channel.',
      );
    }
  }

  // =========================================================
  // TOGGLE ACTIVE
  // =========================================================

  async function toggleChannel(
    channel: YouTubeChannel,
  ) {
    if (!apiUrl) {
      return;
    }

    const token =
      localStorage.getItem('admin_token')

    if (!token) {
      window.location.href =
        '/admin/login';
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response =
        await fetch(
          `${apiUrl}/youtube/managed-channels/${channel.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization:
                `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              isActive:
                !channel.isActive,
            }),
          },
        );

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
        window.location.href =
          '/admin/login';
        return;
      }

      if (!response.ok) {
        throw new Error(
          'Failed to update channel status.',
        );
      }

      await loadChannels();

      setSuccess(
        channel.isActive
          ? 'Channel disabled.'
          : 'Channel enabled.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update channel.',
      );
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              YouTube Channels
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage YouTube channels used for Shorts.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                '/admin')
            }
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* =====================================================
            FORM
        ====================================================== */}

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingId
                  ? 'Edit YouTube Channel'
                  : 'Add YouTube Channel'}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a public YouTube channel for Shorts synchronization.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Channel ID
              </label>

              <input
                value={form.channelId}
                onChange={(event) =>
                  updateForm(
                    'channelId',
                    event.target.value,
                  )
                }
                placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
<div className="mt-3">
  <button
    type="button"
    onClick={verifyChannel}
    disabled={
      verifying ||
      !form.channelId.trim()
    }
    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {verifying
      ? 'Verifying...'
      : 'Verify Channel'}
  </button>
</div>
              <p className="mt-1 text-xs text-gray-400">
                Example: UCfiwzLy-8yKzIbsmZTzxDgw
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Channel Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    'name',
                    event.target.value,
                  )
                }
                placeholder="AlJazeera Arabic"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Handle
              </label>

              <input
                value={form.handle}
                onChange={(event) =>
                  updateForm(
                    'handle',
                    event.target.value,
                  )
                }
                placeholder="@aljazeera"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Used to access the public Shorts page.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Thumbnail URL
              </label>

              <input
                value={form.thumbnailUrl}
                onChange={(event) =>
                  updateForm(
                    'thumbnailUrl',
                    event.target.value,
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="youtube-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateForm(
                    'isActive',
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              <label
                htmlFor="youtube-active"
                className="text-sm font-semibold text-gray-700"
              >
                Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Channel'
                    : 'Add Channel'}
              </button>
            </div>
          </form>
        </section>

        {/* =====================================================
            CHANNELS
        ====================================================== */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Channels
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {channels.length}{' '}
                channel
                {channels.length === 1
                  ? ''
                  : 's'} configured.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading YouTube channels...
            </div>
          ) : channels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-sm font-medium text-gray-600">
                No YouTube channels found.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Add your first channel above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map(
                (channel) => (
                  <div
                    key={channel.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {channel.thumbnailUrl ? (
                        <img
                          src={
                            channel.thumbnailUrl
                          }
                          alt=""
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-400">
                          YT
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-900">
                            {channel.name}
                          </h3>

                          <span
                            className={
                              channel.isActive
                                ? 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600'
                                : 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500'
                            }
                          >
                            {channel.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {channel.handle
                            ? `@${channel.handle.replace(/^@/, '')}`
                            : 'No handle'}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {channel.channelId}
                        </p>

                        {channel.lastSyncedAt && (
                          <p className="mt-1 text-xs text-gray-400">
                            Last sync:{' '}
                            {new Date(
                              channel.lastSyncedAt,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
<button
  type="button"
  onClick={() => syncChannel(channel)}
  disabled={
    syncingId === channel.id ||
    syncingShortsId === channel.id ||
    !channel.isActive
  }
  className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
>
  {syncingId === channel.id ? 'Syncing...' : 'Sync'}
</button>

<button
  type="button"
  onClick={() => syncShorts(channel)}
  disabled={
    syncingShortsId === channel.id ||
    syncingId === channel.id ||
    !channel.isActive
  }
  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
>
  {syncingShortsId === channel.id
    ? 'Syncing Shorts...'
    : 'Sync Shorts'}
</button>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleChannel(
                            channel,
                          )
                        }
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {channel.isActive
                          ? 'Disable'
                          : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            channel,
                          )
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteChannel(
                            channel,
                          )
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}