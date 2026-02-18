"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { FaImage } from "react-icons/fa6";

// Define allowed presets
type ImageType =
  | "avatar"
  | "card"
  | "banner"
  | "gallery"
  | "thumbnail"
  | "full";

// ImageKit Transformations
const IMAGE_PRESETS: Record<ImageType, string> = {
  avatar: "w-120,h-120,c-fill,q-auto,f-auto",
  thumbnail: "w-300,h-220,c-fill,q-auto,f-auto",
  card: "w-420,h-300,c-fill,q-auto,f-auto",
  gallery: "w-800,q-auto,f-auto",
  banner: "w-1600,h-500,c-fill,q-auto,f-auto",
  full: "w-1920,q-auto,f-auto",
};

// Extend Next.js ImageProps but make src optional to handle nulls gracefully
interface AppImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined;
  alt?: string;
  type?: ImageType;
  fallbackIcon?: React.ReactNode;
}

// Simple utility to join classes (Use cn() from clsx/tailwind-merge if you have it)
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function AppImage({
  src,
  alt = "Image",
  type = "card",
  className,
  priority = false,
  fallbackIcon,
  ...rest
}: AppImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatches for random/date-based srcs
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. URL Processing
  const getProcessedUrl = (url: string) => {
    if (!url) return "";

    // Handle ImageKit
    if (url.includes("imagekit.io")) {
      const transform = IMAGE_PRESETS[type];
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}tr=${transform}`;
    }
    return url;
  };

  // 2. Error / Empty State
  if (!src || error) {
    return (
      <div
        className={cn(
          "bg-slate-100 flex items-center justify-center text-slate-300 w-full h-full min-h-[100px] rounded-inherit",
          className
        )}
        role="img"
        aria-label={alt}
      >
        {fallbackIcon || <FaImage size={24} />}
      </div>
    );
  }

  const finalSrc = getProcessedUrl(src);

  // R2 images often timeout on Vercel's optimization layer, so we skip it for them
  const isUnoptimized = src.includes("r2.dev") || src.includes("blob:");

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={finalSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={isUnoptimized}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        className={cn(
          "object-cover duration-500 ease-in-out",
          // Blur effect logic:
          isLoading ? "scale-110 blur-lg grayscale" : "scale-100 blur-0 grayscale-0"
        )}
        {...rest}
      />

      {/* Optional: Skeleton Overlay while loading (if blur isn't enough) */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse -z-10" />
      )}
    </div>
  );
}