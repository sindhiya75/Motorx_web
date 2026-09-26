import React, { useState, useEffect } from 'react';
import { normalizeProductImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

/**
 * Reusable SafeImage component that normalizes paths and gracefully handles load errors.
 */
export default function SafeImage({
  src,
  alt = 'Product image',
  className = '',
  fallback = DEFAULT_FALLBACK_IMAGE,
  loading = 'lazy',
  ...props
}) {
  const normalizedInitial = normalizeProductImageUrl(src) || fallback;
  const [imgSrc, setImgSrc] = useState(normalizedInitial);

  useEffect(() => {
    setImgSrc(normalizeProductImageUrl(src) || fallback);
  }, [src, fallback]);

  const onError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={onError}
      loading={loading}
      className={className}
      {...props}
    />
  );
}
