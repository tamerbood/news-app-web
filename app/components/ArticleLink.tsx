import type { ReactNode } from 'react';
import Link from 'next/link';
import { safeExternalUrl } from '../lib/external-url';

type LinkedArticle = {
  id: string;
  isOriginal?: boolean;
  url?: string | null;
};

export default function ArticleLink({
  article,
  className,
  children,
}: {
  article: LinkedArticle;
  className?: string;
  children: ReactNode;
}) {
  const externalHref = article.isOriginal !== true
    ? safeExternalUrl(article.url)
    : undefined;

  if (externalHref) {
    return (
      <a href={externalHref} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (article.isOriginal === true) {
    return (
      <Link href={`/articles/${encodeURIComponent(article.id)}`} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <span className={className}>
      {children}
    </span>
  );
}
