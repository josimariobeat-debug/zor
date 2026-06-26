import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const cache = new Map<string, string>();

/**
 * Renders a product image. Accepts either:
 *  - a full http(s) URL (used as-is)
 *  - a storage path in the `product-images` bucket (signed URL is generated)
 */
export function ProductImage({
  value,
  alt,
  className,
  fallback,
}: {
  value: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [src, setSrc] = useState<string | null>(() => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return cache.get(value) ?? null;
  });

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setSrc(null);
      return;
    }
    if (/^https?:\/\//i.test(value)) {
      setSrc(value);
      return;
    }
    const cached = cache.get(value);
    if (cached) {
      setSrc(cached);
      return;
    }
    supabase.storage
      .from('product-images')
      .createSignedUrl(value, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        cache.set(value, data.signedUrl);
        setSrc(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) return <>{fallback ?? null}</>;
  return <img src={src} alt={alt} className={className} />;
}
