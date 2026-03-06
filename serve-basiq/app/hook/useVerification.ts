import { useState, useCallback } from 'react';

export function useVerification() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadDocument = useCallback(async (file: File | Blob) => {


        const filename = 'name' in file ? file.name : 'compressed-document.jpg';
        const fileType = file.type || 'image/jpeg';
        const fileSize = file.size;

        const payload = { filename, fileType, fileSize };

        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });


        if (!res.ok) {
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

        const { uploadUrl, publicUrl } = data;

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': fileType },
        });


        if (!uploadRes.ok) {
            const r2Error = await uploadRes.text();
            console.error("🔥 [Hook] R2 Upload failed:", r2Error);
            throw new Error('Failed to upload file to storage bucket');
        }

        return publicUrl;
    }, []);

    const submitVerificationData = useCallback(async (userId: string, form: any, existingProviderType: string) => {
        setIsSubmitting(true);
        try {
            // console.log("🚀 [Hook] Submitting verification data for user:", userId);

            // Update Provider Status if it has changed
            if (form.providerType !== existingProviderType) {
                // console.log("🔄 [Hook] Updating provider status to:", form.providerType);
                await fetch('/api/user/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, providerType: form.providerType })
                });
            }

            // Submit Final Verification Data
            // console.log("📤 [Hook] Sending profile update data...");
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

            // console.log("✅ [Hook] Verification data submitted successfully!");
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