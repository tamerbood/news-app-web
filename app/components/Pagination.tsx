import Link from 'next/link';

export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  function pageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (page > 4) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) pages.push(i);
    if (page < totalPages - 3) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }

  const href = (value: number) => value === 1 ? '/' : `/?page=${value}`;

  return (
    <nav className="mada-pagination" aria-label="ترقيم الأخبار">
      <Link className="mada-page-btn" href={href(Math.max(1, page - 1))} aria-disabled={page === 1}>السابق</Link>
      {pageNumbers().map((number, index) => number === 'ellipsis'
        ? <span key={`e${index}`} className="px-2 text-gray-400" aria-hidden="true">…</span>
        : <Link key={number} className={`mada-page-btn ${page === number ? 'active' : ''}`} href={href(number)} aria-current={page === number ? 'page' : undefined}>{number}</Link>)}
      <Link className="mada-page-btn" href={href(Math.min(totalPages, page + 1))} aria-disabled={page === totalPages}>التالي</Link>
    </nav>
  );
}
