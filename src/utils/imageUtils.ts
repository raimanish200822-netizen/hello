/**
 * Image Cache-Busting Utilities
 * Ensures product and website images bypass stale browser disk/memory caches
 * whenever modified in Admin Panel or retrieved in frontend components.
 */

/**
 * Appends or updates a cache-busting timestamp or version query parameter
 * on HTTP/HTTPS image URLs. Preserves data URIs (base64) and blob URLs intact.
 */
export function appendCacheBuster(url: string | undefined | null, versionOrTimestamp?: number | string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs (Base64) and Blob URLs must NEVER have query parameters attached
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Only apply to web URLs
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return trimmed;
  }

  const version = versionOrTimestamp || Date.now();

  try {
    // Strip out any existing version or timestamp query parameters (?v=..., &v=..., ?t=..., &t=...)
    const cleanUrl = trimmed
      .replace(/([?&])(v|t|_v|ver)=\d+(&?)/gi, (match, prefix, key, suffix) => {
        return suffix ? prefix : '';
      })
      .replace(/[?&]$/, '');

    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}v=${version}`;
  } catch {
    return trimmed;
  }
}

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80';

/**
 * Retrieves a cache-busted image URL for frontend components.
 * If versionOrTimestamp is provided (e.g. product.updatedAt or image.version),
 * ensures that specific version is appended to the image URL.
 */
export function getCacheBustedImageUrl(
  url: string | undefined | null,
  versionOrTimestamp?: number | string,
  fallback = DEFAULT_FALLBACK_IMAGE
): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  return appendCacheBuster(trimmed, versionOrTimestamp);
}

/**
 * Utility to process a product item and apply cache-busting to all its images
 * with a unified timestamp.
 */
export function cacheBustProduct<T extends { images?: { url: string; alt?: string; caption?: string; version?: number }[]; updatedAt?: number }>(
  product: T,
  forcedTimestamp?: number
): T {
  const timestamp = forcedTimestamp || Date.now();
  const nextImages = (product.images || []).map(img => {
    if (img && img.url && !img.url.startsWith('data:') && !img.url.startsWith('blob:')) {
      return {
        ...img,
        url: appendCacheBuster(img.url, timestamp),
        version: timestamp
      };
    }
    return img;
  });

  return {
    ...product,
    updatedAt: timestamp,
    images: nextImages
  };
}
