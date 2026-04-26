const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_QUALITY = 80;
const FALLBACK_OG_IMAGE = 'https://www.servebasiq.in/logo.png';

export function toOgImageUrl(src?: string | null): string {
  if (!src || !src.trim()) return FALLBACK_OG_IMAGE;
  const url = src.trim();

  if (!/^https?:\/\//i.test(url)) return FALLBACK_OG_IMAGE;

  if (url.includes('ik.imagekit.io')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}tr=w-${OG_WIDTH},h-${OG_HEIGHT},c-maintain_ratio,fo-auto,q-${OG_QUALITY},f-jpg`;
  }

  return url;
}

export const OG_IMAGE_DIMENSIONS = { width: OG_WIDTH, height: OG_HEIGHT };
