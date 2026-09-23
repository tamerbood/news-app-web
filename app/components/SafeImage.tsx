'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK_IMAGE: ImageProps['src'] = '/icons/icon-512.png';
const DEFAULT_FILL_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: ImageProps['src'];
  fallbackSrc?: ImageProps['src'];
};

export default function SafeImage({
  src,
  fallbackSrc = FALLBACK_IMAGE,
  onError,
  className,
  alt,
  sizes,
  loading,
  priority,
  fill,
  ...props
}: SafeImageProps) {
  const [imgError, setImgError] = useState(false);

  // Reset the guarded error state only when the actual source changes.
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const hasSource = Boolean(src);
  const showFallback = imgError || !hasSource;
  const safeClassName = [className, showFallback ? 'mada-safe-image-fallback' : ''].filter(Boolean).join(' ');

  // A failed/missing remote image becomes a plain placeholder DIV. This is
  // intentionally not another fallible remote Image, so onError can never loop.
  if (showFallback) {
    return (
      <div
        className={[safeClassName, 'mada-image-fallback-box'].filter(Boolean).join(' ')}
        role="img"
        aria-label={typeof alt === 'string' && alt ? alt : 'صورة غير متاحة'}
      >
        <Image
          src={fallbackSrc}
          alt=""
          width={34}
          height={34}
          className="mada-image-fallback-logo"
          aria-hidden="true"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src!}
      alt={alt}
      fill={fill}
      className={safeClassName}
      sizes={sizes ?? (fill ? DEFAULT_FILL_SIZES : undefined)}
      loading={priority ? undefined : (loading ?? 'lazy')}
      priority={priority}
      onError={(event) => {
        // Guard is critical: only one state transition is allowed per source.
        if (!imgError) {
          setImgError(true);
          onError?.(event);
        }
      }}
    />
  );
}
