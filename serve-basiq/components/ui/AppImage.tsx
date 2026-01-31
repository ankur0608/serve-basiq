"use client";

import React, { useState } from "react";
import Image from "next/image"; // Optional: Use Next.js Image for optimization if preferred

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

// Keep presets if you integrate an Image CDN later
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

  // If src is missing or error occurred, show fallback
  if (!src || error) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider ${className}`}
      >
        <span>No IMG</span>
      </div>
    );
  }

  // ✅ FIX: Determine if we should apply ImageKit transformations
  // Only apply if the URL actually belongs to your ImageKit endpoint
  const isImageKit = src.includes("imagekit.io");

  let finalSrc = src;

  if (isImageKit) {
    const transform = IMAGE_PRESETS[type];
    // Append query param correctly (handle existing query params)
    const separator = src.includes("?") ? "&" : "?";
    finalSrc = `${src}${separator}tr=${transform}`;
  }

  // ✅ Render Standard Image Tag (Safer for mixed sources like Google/Local)
  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={(e) => {
        // Prevent infinite error loops if fallback fails
        setError(true);
      }}
      className={`transition-opacity duration-300 ${className}`}
    />
  );
}