"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { FaImage } from "react-icons/fa6";

type ImageType = "avatar" | "card" | "banner" | "gallery" | "thumbnail" | "full" | "icon";

const IMAGE_PRESETS: Record<ImageType, string> = {
  icon: "w-80,h-80,c-at_max,q-auto,f-auto",
  avatar: "w-120,h-120,c-fill,q-auto,f-auto",
  thumbnail: "w-300,h-220,c-fill,q-auto,f-auto",
  card: "w-420,h-300,c-fill,q-auto,f-auto",
  gallery: "w-800,q-auto,f-auto",
  banner: "w-1600,h-500,c-fill,q-auto,f-auto",
  full: "w-1920,q-auto,f-auto",
};

interface AppImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined;
  alt?: string;
  type?: ImageType;
  fallbackIcon?: React.ReactNode;
  imageClassName?: string;
}

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function AppImage({
  src,
  alt = "Image",
  type = "card",
  className,
  imageClassName = "object-cover",
  priority = false,
  fallbackIcon,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...rest
}: AppImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getProcessedUrl = (url: string) => {
    if (!url) return "";

    // Pulls from your environment variables
    const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
    const R2_DOMAIN = "pub-eed0956fae1644049c2d454121ca27a4.r2.dev";

    let finalUrl = url;

    // Intercept R2 URLs and route them to ImageKit, assuming the env variable exists
    if (IMAGEKIT_ENDPOINT && url.includes(R2_DOMAIN)) {
      // Remove trailing slash if present in the env variable to avoid double slashes
      const cleanEndpoint = IMAGEKIT_ENDPOINT.replace(/\/$/, "");
      finalUrl = url.replace(`https://${R2_DOMAIN}`, cleanEndpoint);
    }

    // Apply the sizing transformations
    if (finalUrl.includes("imagekit.io")) {
      const transform = IMAGE_PRESETS[type];
      const separator = finalUrl.includes("?") ? "&" : "?";
      return `${finalUrl}${separator}tr=${transform}`;
    }

    return finalUrl;
  };

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
  
  // Since we are now compressing via ImageKit, it is safe to skip Vercel's optimizer
  const isUnoptimized = src.includes("r2.dev") || src.includes("blob:") || src.includes("imagekit.io");

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={finalSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={isUnoptimized} 
        sizes={sizes}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        className={cn(
          "duration-500 ease-in-out",
          imageClassName,
          isLoading ? "scale-110 blur-lg grayscale" : "scale-100 blur-0 grayscale-0"
        )}
        {...rest}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse -z-10" />
      )}
    </div>
  );
}