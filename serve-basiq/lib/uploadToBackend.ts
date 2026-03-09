// ✅ 1. Add 'folder' parameter with a default fallback of "misc"
export async function uploadToBackend(file: File, folder: string = "misc"): Promise<string> {
    try {
        // console.log(`🚀 [uploadToBackend] Starting upload for: ${file.name} to folder: ${folder}`);
        // console.log(`📦 [uploadToBackend] File info: ${(file.size / 1024 / 1024).toFixed(2)} MB | Type: ${file.type}`);

        // console.log(`⏳ [uploadToBackend] Step 1: Requesting presigned URL from /api/upload...`);
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: file.name,
                fileType: file.type,
                fileSize: file.size,
                folder: folder, // ✅ 2. Pass the folder name to your API!
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error(`❌ [uploadToBackend] API Error:`, errorData);
            throw new Error(errorData.message || 'Failed to get upload URL');
        }

        const { uploadUrl, publicUrl } = await res.json();

        // console.log(`✅ [uploadToBackend] Step 1 Complete: Presigned URL received!`);
        // console.log(`🌐 [uploadToBackend] Final Public URL will be: ${publicUrl}`);

        // console.log(`⏳ [uploadToBackend] Step 2: Uploading file directly to Cloudflare R2...`);
        const r2Res = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!r2Res.ok) {
            console.error(`❌ [uploadToBackend] R2 Upload Failed with status: ${r2Res.status}`);
            throw new Error('Failed to upload file directly to Cloudflare R2');
        }

        // console.log(`✅ [uploadToBackend] Step 2 Complete: File successfully uploaded to R2!`);

        return publicUrl;

    } catch (error) {
        console.error("🔥 [uploadToBackend] Critical Error caught:", error);
        throw error;
    }
}