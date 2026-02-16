import AppImage from '@/components/ui/AppImage';
import { UploadCloud, Loader2, Trash2, Plus, ChevronRight } from 'lucide-react';
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

    // Options for compression
    const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };

    // --- 1. Handler for Main Image (Single - Keep as is but with compression) ---
    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedFile = await imageCompression(file, compressionOptions);
            // Create a new File object
            const newFile = new File([compressedFile], file.name, { type: file.type });

            // Create synthetic event
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);
            const syntheticEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;

            handleImageUpload(syntheticEvent, 'main');
        } catch (error) {
            console.error("Compression failed", error);
            handleImageUpload(e, 'main'); // Fallback
        }
    };

    // --- 2. Handler for Gallery (Multiple) ---
    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Convert FileList to Array
        const fileArray = Array.from(files);

        try {
            // Compress all images in parallel
            const compressedFiles = await Promise.all(
                fileArray.map(async (file) => {
                    try {
                        const compressedBlob = await imageCompression(file, compressionOptions);
                        // Convert Blob back to File to preserve name/type for the uploader
                        return new File([compressedBlob], file.name, { type: file.type });
                    } catch (err) {
                        console.warn(`Failed to compress ${file.name}, using original.`);
                        return file;
                    }
                })
            );

            // Pass the array of prepared files to the parent
            handleGalleryUpload(compressedFiles);

        } catch (error) {
            console.error("Batch processing failed", error);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Main Image Section */}
            <div>
                <label className={labelClass}>Main Product Image</label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange} // Use the specific main handler
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
                            <span className="text-xs font-bold">Click to Upload</span>
                        </div>
                    )}
                    {uploading && activeUploadField === 'main' && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Section */}
            <div>
                <label className={labelClass}>Gallery (Optional)</label>
                <div className="grid grid-cols-4 gap-2">
                    {/* Existing Images */}
                    {form.gallery.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                            <AppImage
                                src={img}
                                alt={`Gallery ${i}`}
                                type="thumbnail"
                                className="w-full h-full object-cover"
                            />
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
                            accept="image/*"
                            multiple={true} // ✅ Enable Multiple Selection
                            onChange={handleGalleryChange} // ✅ Use new batch handler
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />
                        {uploading && activeUploadField === 'gallery' ? (
                            <Loader2 className="animate-spin text-blue-400" size={16} />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Plus className="text-slate-400" size={20} />
                                <span className="text-[10px] text-slate-400 font-medium">Add Files</span>
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