import imageCompression from 'browser-image-compression';

export async function uploadImage(file: File): Promise<string> {
    try {
        let fileToUpload = file;

        if (file.type.startsWith('image/')) {
            const options = {
                maxSizeMB: 1,           
                maxWidthOrHeight: 1920, 
                useWebWorker: true,
                initialQuality: 0.8
            };

            try {
                // console.log(`Original: ${file.size / 1024 / 1024} MB`);
                fileToUpload = await imageCompression(file, options);
                // console.log(`Compressed: ${fileToUpload.size / 1024 / 1024} MB`);
            } catch (err) {
                console.warn("Compression failed, uploading original file.", err);
            }
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();

        // --- STEP 4: RETURN URL ---
        // Handles both direct URLs or Keys (depending on your API response)
        if (data.url) return data.url;

        // Fallback if API returns a key (like in Service logic)
        const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_R2_DOMAIN;
        return urlEndpoint ? `${urlEndpoint.replace(/\/$/, "")}/${data.key}` : data.key;

    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}