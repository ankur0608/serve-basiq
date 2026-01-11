// lib/imagekit-url.ts
export function imagekitUrl(
  key: string,
  opts?: { w?: number; q?: number }
) {
  const tr = [
    opts?.w && `w-${opts.w}`,
    opts?.q && `q-${opts.q}`,
  ]
    .filter(Boolean)
    .join(",");
    
  return `${process.env.IMAGEKIT_URL_ENDPOINT}/${key}${
    tr ? `?tr=${tr}` : ""
  }`;
}
