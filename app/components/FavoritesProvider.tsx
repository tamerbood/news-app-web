'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  loadingId: string | null;
  toggle: (id: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!token || !apiUrl) return;

    let cancelled = false;
    fetch(`${apiUrl}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        const bookmarks = Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : [];
        if (!cancelled) setFavoriteIds(new Set(bookmarks.map((article: { id?: string }) => article.id).filter(Boolean) as string[]));
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, []);

  async function toggle(id: string) {
    const token = localStorage.getItem('user_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!token) { window.location.href = '/login'; return; }
    if (!apiUrl) return;

    const isFavorite = favoriteIds.has(id);
    setLoadingId(id);
    try {
      const response = await fetch(`${apiUrl}/bookmarks/${id}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('تعذر تحديث المفضلة.');
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFavorite) next.delete(id); else next.add(id);
        return next;
      });
    } finally {
      setLoadingId(null);
    }
  }

  const value = useMemo(() => ({ favoriteIds, loadingId, toggle }), [favoriteIds, loadingId]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}

export default FavoritesProvider;
