import { useState, useCallback } from 'react';
import { uploadToBackend } from '@/lib/uploadToBackend'; 
import imageCompression from 'browser-image-compression';

// ✅ Custom settings for Documents: Higher resolution than avatars so text remains readable
const DOC_COMPRESSION_OPTIONS = {
    maxSizeMB: 0.5,           // Targets ~500KB (perfect for reading text on IDs)
    maxWidthOrHeight: 1920,   // Keeps enough pixels to read fine print
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.8
};

export function useVerification() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadDocument = useCallback(async (file: File | Blob) => {
        try {
            // 1. Standardize the incoming file
            let originalFile: File;
            if (file instanceof File) {
                originalFile = file;
            } else {
                originalFile = new File([file], 'verification-document.jpg', { 
                    type: file.type || 'image/jpeg' 
                });
            }

            // 2. Compress and forcefully convert to WebP format
            const compressedBlob = await imageCompression(originalFile, DOC_COMPRESSION_OPTIONS);
            
            // 3. Rename the file to ensure it has the .webp extension
            const newFileName = originalFile.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([compressedBlob], newFileName, { 
                type: 'image/webp' 
            });

            // 4. Upload the new WebP file to Cloudflare R2
            const publicUrl = await uploadToBackend(webpFile, "users");
            
            return publicUrl;
            
        } catch (error: any) {
            console.error("🔥 [Hook] Document upload/compression failed:", error);
            throw new Error(error.message || 'Failed to process and upload document');
        }
    }, []);

    const submitVerificationData = useCallback(async (userId: string, form: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error("🔥 [Hook] Verification submission failed:", data);
                throw new Error(data.error || data.message || 'Submission failed');
            }

            return true;
        } catch (error: any) {
            console.error("🔥 [Hook] submitVerificationData error:", error);
            throw new Error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        uploadDocument,
        submitVerificationData,
        isSubmitting
    };
}