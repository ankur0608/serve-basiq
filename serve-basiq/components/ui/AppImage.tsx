"use client";

import React, { useState } from "react";

type ImageType =
  | "avatar"
  | "card"
  | "banner"
  | "gallery"
  | "thumbnail"
  | "full";

interface AppImageProps {
  src: string;
  alt?: string;
  type?: ImageType;
  className?: string;
  priority?: boolean;
}

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
  alt = "",
  type = "card",
  className = "",
  priority = false,
}: AppImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-xs text-slate-400 ${className}`}
      >
        No Image
      </div>
    );
  }

  const transform = IMAGE_PRESETS[type];
  const finalSrc = `${src}?tr=${transform}`;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setError(true)}
      className={className}
    />
  );
}
