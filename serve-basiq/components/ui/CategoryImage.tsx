'use client'; // <--- This marks it as a Client Component

import { ImageOff } from "lucide-react";
import React, { useState } from "react";

interface CategoryImageProps {
  src?: string | null;
  alt: string;
}

export default function CategoryImage({ src, alt }: CategoryImageProps) {
  const [error, setError] = useState(false);

  // If no source is provided or if an error occurred previously
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-blue-400 opacity-50">
        <ImageOff size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
      onError={() => setError(true)} // ✅ This works now because we are in a Client Component
    />
  );
}