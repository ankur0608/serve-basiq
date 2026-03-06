'use client'; 

import { ImageOff } from "lucide-react";
import React, { useState } from "react";

interface CategoryImageProps {
  src?: string | null;
  alt: string;
}

export default function CategoryImage({ src, alt }: CategoryImageProps) {
  const [error, setError] = useState(false);

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
      onError={() => setError(true)} 
    />
  );
}