'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK_IMAGE: ImageProps['src'] = '/icons/icon-512.png';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: ImageProps['src'];
  fallbackSrc?: ImageProps['src'];
};

export default function SafeImage({ src, fallbackSrc = FALLBACK_IMAGE, onError, className, alt, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps['src']>(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const isFallback = currentSrc === fallbackSrc;
  const safeClassName = [className, isFallback ? 'mada-safe-image-fallback' : ''].filter(Boolean).join(' ');

  if (isFallback) {
    return (
      <div className={[safeClassName, 'mada-image-fallback-box'].filter(Boolean).join(' ')} role="img" aria-label={typeof alt === 'string' && alt ? alt : 'صورة غير متاحة'}>
        <Image src="/icons/icon-512.png" alt="" width={34} height={34} className="mada-image-fallback-logo" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      className={safeClassName}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
