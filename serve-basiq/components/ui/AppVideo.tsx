// components/ui/AppVideo.tsx
"use client";

import React from 'react';

interface AppVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
}

export default function AppVideo({ src, className = "", ...props }: AppVideoProps) {
    return (
        <video
            src={src}
            controls // Allows play/pause/volume
            controlsList="nodownload noremoteplayback noplaybackrate" // Hides download, cast, and speed options
            disablePictureInPicture // Prevents floating video player
            onContextMenu={(e) => e.preventDefault()} // Disables right-click (prevents "Save video as...")
            preload="metadata" // Production optimization: only loads video metadata until user hits play
            className={`object-cover ${className}`}
            {...props}
        >
            <source src={src} />
            Your browser does not support the video tag.
        </video>
    );
}