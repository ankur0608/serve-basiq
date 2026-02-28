import { useState, useCallback } from 'react';

export function useVerification() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- API CALL 1: Two-Step File Upload (Presigned URL + R2 PUT) ---
    const uploadDocument = useCallback(async (file: File | Blob) => {
        console.log("🚀 [Hook] uploadDocument triggered");
        console.log("📦 [Hook] Original file object:", file);

        // Safely extract properties (Compression sometimes returns a Blob without a name)
        const filename = 'name' in file ? file.name : 'compressed-document.jpg';
        const fileType = file.type || 'image/jpeg';
        const fileSize = file.size;

        const payload = { filename, fileType, fileSize };
        console.log("📤 [Hook] Sending JSON payload to /api/upload:", payload);

        // Step A: Get the Presigned URL from your API
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        console.log("📥 [Hook] /api/upload response status:", res.status);

        if (!res.ok) {
            // Read as text first to avoid crashing if the server sends back HTML or malformed JSON
            const errText = await res.text();
            console.error("🔥 [Hook] /api/upload error body:", errText);

            let errorMessage = 'Failed to generate upload URL';
            try {
                const errData = JSON.parse(errText);
                errorMessage = errData.message || errorMessage;
            } catch (e) {
                // Ignore parse error on the error response itself
            }
            throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log("✅ [Hook] Presigned URL received successfully:", data);

        const { uploadUrl, publicUrl } = data;

        // Step B: Upload the file directly to R2
        console.log("⬆️ [Hook] Starting PUT request directly to R2...");
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': fileType },
        });

        console.log("📥 [Hook] R2 PUT response status:", uploadRes.status);

        if (!uploadRes.ok) {
            const r2Error = await uploadRes.text();
            console.error("🔥 [Hook] R2 Upload failed:", r2Error);
            throw new Error('Failed to upload file to storage bucket');
        }

        console.log("🎉 [Hook] File uploaded successfully! Public URL:", publicUrl);
        return publicUrl;
    }, []);

    // --- API CALL 2 & 3: Submit Form & Update Provider Status ---
    const submitVerificationData = useCallback(async (userId: string, form: any, existingProviderType: string) => {
        setIsSubmitting(true);
        try {
            console.log("🚀 [Hook] Submitting verification data for user:", userId);

            // Update Provider Status if it has changed
            if (form.providerType !== existingProviderType) {
                console.log("🔄 [Hook] Updating provider status to:", form.providerType);
                await fetch('/api/user/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, providerType: form.providerType })
                });
            }

            // Submit Final Verification Data
            console.log("📤 [Hook] Sending profile update data...");
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

            console.log("✅ [Hook] Verification data submitted successfully!");
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