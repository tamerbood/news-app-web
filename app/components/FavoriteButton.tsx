'use client';

import { useFavorites } from './FavoritesProvider';

export default function FavoriteButton({ id }: { id: string }) {
  const { favoriteIds, loadingId, toggle } = useFavorites();
  const favorite = favoriteIds.has(id);
  const loading = loadingId === id;

  return (
    <button
      className={`mada-icon-btn ${favorite ? 'saved' : ''}`}
      onClick={() => void toggle(id)}
      disabled={loading}
      aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      {loading ? '…' : favorite ? '★' : '☆'}
    </button>
  );
}
