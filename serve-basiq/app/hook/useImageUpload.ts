import { useState } from "react";

interface UseImageUploadOptions {
    initialUrl?: string | null;
    onUploadSuccess?: (key: string, url: string) => void;
    maxSizeMB?: number;
}

export function useImageUpload({
    initialUrl = null,
    onUploadSuccess,
    maxSizeMB = 5
}: UseImageUploadOptions = {}) {

    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
    const [fileKey, setFileKey] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError("");

        if (!file) return;

        // 1. Client-side Validation
        if (!file.type.startsWith("image/")) {
            setError("File must be an image (JPG, PNG, WEBP)");
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        try {
            setIsUploading(true);

            // 2. Get Presigned URL
            const presignRes = await fetch("/api/upload/presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    size: file.size,
                }),
            });

            if (!presignRes.ok) throw new Error("Failed to initialize upload");

            const { uploadUrl, publicUrl, key } = await presignRes.json();

            // 3. Upload directly to R2
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            // 4. Update State
            setPreviewUrl(publicUrl);
            setFileKey(key);

            // Optional: Callback to update your parent form (e.g., form.profileImage = key)
            if (onUploadSuccess) {
                onUploadSuccess(key, publicUrl);
            }

        } catch (err: any) {
            console.error(err);
            setError("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        setFileKey(null);
        if (onUploadSuccess) onUploadSuccess("", "");
    };

    return {
        previewUrl,
        fileKey,
        isUploading,
        uploadError: error,
        handleImageUpload,
        removeImage,
        setPreviewUrl // Exported in case you need to set it manually from session
    };
}