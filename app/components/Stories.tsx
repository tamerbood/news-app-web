import { optimizeImageUrl } from '../lib/optimized-image-url';
'use client';

import { useEffect, useRef, useState } from 'react';

type Story = {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType?: string;
  actionUrl?: string | null;
  sourceId?: string | null;
  isActive: boolean;
  sortOrder?: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  sourceName?: string | null;
  sourceLogoUrl?: string | null;
};

export default function Stories({ initialStories = [] }: { initialStories?: Story[] }) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [loading, setLoading] = useState(initialStories.length === 0);
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  async function loadStories() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${api}/stories`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to load stories');
      }

      const data = await response.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setStories(
        items.filter(
          (story: Story) =>
            story &&
            story.isActive !== false &&
            typeof story.mediaUrl === 'string' &&
            story.mediaUrl.trim(),
        ),
      );
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // The first payload is already rendered server-side. Avoid an immediate
    // duplicate request during hydration; refresh in the background later.
    const interval = window.setInterval(loadStories, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelected(null);
      }

      if (event.key === 'ArrowRight') {
        setSelected((current) =>
          current === null
            ? current
            : Math.min(current + 1, stories.length - 1),
        );
      }

      if (event.key === 'ArrowLeft') {
        setSelected((current) =>
          current === null
            ? current
            : Math.max(current - 1, 0),
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const previousActive = document.activeElement as HTMLElement | null;
    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusDialog = () => {
      const first = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    };
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleTab);
    requestAnimationFrame(focusDialog);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      (lastTriggerRef.current ?? previousActive)?.focus?.();
    };
  }, [selected, stories.length]);

  if (loading && stories.length === 0) {
    return (
      <section
        dir="rtl"
        className="mb-8 rounded-2xl bg-white p-4 shadow-sm"
      >
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="shrink-0 text-center">
              <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
              <div className="mx-auto mt-2 h-3 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  const activeStory =
    selected === null ? null : stories[selected];

  return (
    <>
      <section
        dir="rtl"
        className="mb-8 overflow-hidden rounded-2xl bg-white p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            القصص
          </h2>
          <span className="text-xs text-gray-500">
            أخبار من المصادر
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              onClick={(event) => { lastTriggerRef.current = event.currentTarget; setSelected(index); }}
              className="w-24 shrink-0 text-center outline-none"
              aria-label={`فتح قصة ${story.title}`}
            >
              <span className="mx-auto block h-20 w-20 rounded-full bg-gradient-to-br from-black via-gray-700 to-gray-300 p-[3px]">
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100">
                  {story.sourceLogoUrl ? (
                    <img
                      src={optimizeImageUrl(story.sourceLogoUrl, 160)}
                      alt=""
                      width="80"
                      height="80"
                      sizes="80px"
                      className="h-full w-full object-contain bg-white p-2"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      src={optimizeImageUrl(story.mediaUrl, 160)}
                      alt=""
                      width="80"
                      height="80"
                      sizes="80px"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  )}
                </span>
              </span>

              <span className="mt-2 block truncate text-xs font-semibold text-gray-800">
                {story.sourceName || story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeStory && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-dialog-title"
          ref={dialogRef}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl text-white transition hover:bg-black/80"
            aria-label="إغلاق"
          >
            ×
          </button>

          <button
            type="button"
            onClick={() =>
              setSelected((current) =>
                current === null
                  ? current
                  : Math.max(current - 1, 0),
              )
            }
            disabled={selected === 0}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white disabled:opacity-20 md:block"
            aria-label="القصة السابقة"
          >
            ›
          </button>

          <button
            type="button"
            onClick={() =>
              setSelected((current) =>
                current === null
                  ? current
                  : Math.min(current + 1, stories.length - 1),
              )
            }
            disabled={selected === stories.length - 1}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white disabled:opacity-20 md:block"
            aria-label="القصة التالية"
          >
            ‹
          </button>

          <div className="relative h-[min(82vh,760px)] w-full max-w-[430px] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
            <div className="absolute left-3 right-3 top-3 z-10 flex gap-1">
              {stories.map((story, index) => (
                <span
                  key={story.id}
                  className={`h-1 flex-1 rounded-full ${
                    index === selected
                      ? 'bg-white'
                      : 'bg-white/35'
                  }`}
                />
              ))}
            </div>

            {activeStory.mediaType === 'video' ? (
              <video
                key={activeStory.id}
                src={optimizeImageUrl(activeStory.mediaUrl, 860)}
                className="h-full w-full object-cover"
                autoPlay
                loop
                controls
                playsInline
              />
            ) : (
              <img
                src={optimizeImageUrl(activeStory.mediaUrl, 860)}
                alt={activeStory.title}
                width="430"
                height="760"
                className="h-full w-full object-cover"
              />
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 pt-24 text-white">
              <div className="mb-2 flex items-center gap-2">
                {activeStory.sourceLogoUrl && (
                  <img
                    src={optimizeImageUrl(activeStory.sourceLogoUrl, 64)}
                    alt=""
                    className="h-7 w-7 rounded-full bg-white object-contain p-1"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="text-sm font-semibold">
                  {activeStory.sourceName || 'مصدر إخباري'}
                </span>
              </div>

              <h3 id="story-dialog-title" className="text-xl font-bold leading-8">
                {activeStory.title}
              </h3>

              {activeStory.description && (
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/90">
                  {activeStory.description}
                </p>
              )}

              {activeStory.actionUrl && (
                <a
                  href={activeStory.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-900"
                >
                  قراءة الخبر
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
