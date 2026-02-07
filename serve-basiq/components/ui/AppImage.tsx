"use client";

import React, { useState } from "react";
import Image from "next/image"; // ✅ Using Next.js Image
import { FaImage } from "react-icons/fa6"; // Optional: Icon for error state

type ImageType =
  | "avatar"
  | "card"
  | "banner"
  | "gallery"
  | "thumbnail"
  | "full";

interface AppImageProps {
  src: string | null | undefined;
  alt?: string;
  type?: ImageType;
  className?: string;
  priority?: boolean;
}

// ImageKit Presets (Optional usage)
const IMAGE_PRESETS: Record<ImageType, string> = {
  avatar: "w-120,h-120,c-fill,q-auto,f-auto",
  thumbnail: "w-300,h-220,c-fill,q-auto,f-auto",
  card: "w-420,h-300,c-fill,q-auto,f-auto",
  gallery: "w-800,q-auto,f-auto",
  banner: "w-1600,h-500,c-fill,q-auto,f-auto",
  full: "w-1920,q-auto,f-auto",
};

export default function AppImage({
  src,
  alt = "Image",
  type = "card",
  className = "",
  priority = false,
}: AppImageProps) {
  const [error, setError] = useState(false);

  // 1. Handle Missing Source or Error
  if (!src || error) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-slate-300 ${className}`}
        title="Image not found"
      >
        <FaImage size={24} />
      </div>
    );
  }

  // 2. Check for R2 (Cloudflare) to skip optimization
  // This fixes the "upstream image response timed out" 500 error
  const isR2Image = src.includes("r2.dev");

  // 3. Handle ImageKit Transformations (Optional)
  let finalSrc = src;
  const isImageKit = src.includes("imagekit.io");

  if (isImageKit) {
    const transform = IMAGE_PRESETS[type];
    const separator = src.includes("?") ? "&" : "?";
    finalSrc = `${src}${separator}tr=${transform}`;
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill // ✅ Adapts to parent container size
      priority={priority}
      // ✅ Critical Fix: Skip Next.js optimization for R2 to avoid timeouts
      unoptimized={isR2Image}
      className={`object-cover transition-opacity duration-300 ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setError(true)}
    />
  );
}