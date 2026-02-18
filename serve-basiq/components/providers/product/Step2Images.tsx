import AppImage from '@/components/ui/AppImage';
import { UploadCloud, Loader2, Trash2, Plus, ChevronRight, PlayCircle, FileVideo } from 'lucide-react';
import { ProductForm } from './AddProductView';
import imageCompression from 'browser-image-compression';

interface Step2Props {
    form: ProductForm;
    uploading: boolean;
    activeUploadField: 'main' | 'gallery' | null;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'main') => void;
    handleGalleryUpload: (files: File[]) => void;
    removeGalleryImg: (index: number) => void;
    setStep: (step: number) => void;
}

export function Step2Images({ form, uploading, activeUploadField, handleImageUpload, handleGalleryUpload, removeGalleryImg, setStep }: Step2Props) {
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    // Options for IMAGE compression
    const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };

    // --- Helper: Check if URL is video ---
    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm)$/i) || url.includes('video');
    };

    // --- 1. Handler for Main Image (Images Only) ---
    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedFile = await imageCompression(file, compressionOptions);
            const newFile = new File([compressedFile], file.name, { type: file.type });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);
            const syntheticEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
            handleImageUpload(syntheticEvent, 'main');
        } catch (error) {
            console.error("Compression failed", error);
            handleImageUpload(e, 'main');
        }
    };

    // --- 2. Handler for Gallery (Images AND Videos) ---
    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const processedFiles: File[] = [];

        // Loop through all files
        for (const file of fileArray) {
            if (file.type.startsWith('image/')) {
                // ✅ Compress Images
                try {
                    const compressedBlob = await imageCompression(file, compressionOptions);
                    processedFiles.push(new File([compressedBlob], file.name, { type: file.type }));
                } catch (err) {
                    processedFiles.push(file); // Fallback to original
                }
            } else if (file.type.startsWith('video/')) {
                // ✅ Allow Videos (Skip compression to prevent browser crash, handle size in API)
                // Note: Browser-side video compression (ffmpeg.wasm) is too heavy for standard forms.
                processedFiles.push(file);
            }
        }

        // Send mixed array to parent
        handleGalleryUpload(processedFiles);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Main Image Section (Images Only) */}
            <div>
                <label className={labelClass}>Main Product Image</label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                    <input
                        type="file"
                        accept="image/*" // Main image stays image-only
                        onChange={handleMainImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                    />
                    {form.productImage ? (
                        <AppImage
                            src={form.productImage}
                            alt="Product Preview"
                            type="card"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-slate-400">
                            <UploadCloud className="mx-auto mb-2" size={24} />
                            <span className="text-xs font-bold">Click to Upload Image</span>
                        </div>
                    )}
                    {uploading && activeUploadField === 'main' && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Section (Images & Videos) */}
            <div>
                <label className={labelClass}>Gallery (Images & Video)</label>
                <div className="grid grid-cols-4 gap-2">
                    {/* Render Existing Gallery Items */}
                    {form.gallery.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-black">

                            {/* ✅ CONDITIONAL RENDERING: Video vs Image */}
                            {isVideo(url) ? (
                                <>
                                    <video
                                        src={url}
                                        className="w-full h-full object-cover opacity-80"
                                        muted
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none">
                                        <PlayCircle size={24} fill="rgba(0,0,0,0.5)" />
                                    </div>
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1">
                                        <FileVideo size={10} /> VIDEO
                                    </div>
                                </>
                            ) : (
                                <AppImage
                                    src={url}
                                    alt={`Gallery ${i}`}
                                    type="thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => removeGalleryImg(i)}
                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-10"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}

                    {/* Gallery Upload Button */}
                    <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept="image/*, video/mp4, video/webm" // ✅ Added Video Types
                            multiple={true}
                            onChange={handleGalleryChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />
                        {uploading && activeUploadField === 'gallery' ? (
                            <Loader2 className="animate-spin text-blue-400" size={16} />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Plus className="text-slate-400" size={20} />
                                <span className="text-[10px] text-slate-400 font-medium text-center px-1">Add Images <br /> or Video</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}