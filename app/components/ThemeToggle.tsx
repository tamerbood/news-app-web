'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle({ admin = false }: { admin?: boolean }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mada_theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enabled = saved ? saved === 'dark' : prefers;
    setDark(enabled);
    document.documentElement.classList.toggle('dark', enabled);
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('mada_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      className={admin ? 'admin-theme-toggle' : 'mada-theme-toggle'}
      aria-label={dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
      <span className="sr-only">{dark ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
    </button>
  );
}
