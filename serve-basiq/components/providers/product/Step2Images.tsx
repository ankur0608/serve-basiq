import AppImage from '@/components/ui/AppImage';
import { UploadCloud, Loader2, Trash2, Plus, PlayCircle, FileVideo, Save } from 'lucide-react';
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
    isSaving: boolean;
    editingProduct?: any;
}

export function Step2Media({ form, uploading, activeUploadField, handleImageUpload, handleGalleryUpload, removeGalleryImg, setStep, isSaving, editingProduct }: Step2Props) {
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

    const isVideo = (url: string) => url.match(/\.(mp4|webm)$/i) || url.includes('video');

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

    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const processedFiles: File[] = [];

        for (const file of fileArray) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedBlob = await imageCompression(file, compressionOptions);
                    processedFiles.push(new File([compressedBlob], file.name, { type: file.type }));
                } catch (err) {
                    processedFiles.push(file);
                }
            } else if (file.type.startsWith('video/')) {
                processedFiles.push(file);
            }
        }
        handleGalleryUpload(processedFiles);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
                <label className={labelClass}>Main Product Image <span className="text-red-500">*</span></label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                    />
                    {form.productImage ? (
                        <AppImage src={form.productImage} alt="Product Preview" type="card" className="w-full h-full object-cover" />
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

            <div>
                <label className={labelClass}>Gallery (Images & Video)</label>
                <div className="grid grid-cols-4 gap-2">
                    {form.gallery.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-black">
                            {isVideo(url) ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                    <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none">
                                        <PlayCircle size={24} fill="rgba(0,0,0,0.5)" />
                                    </div>
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1">
                                        <FileVideo size={10} /> VIDEO
                                    </div>
                                </>
                            ) : (
                                <AppImage src={url} alt={`Gallery ${i}`} type="thumbnail" className="w-full h-full object-cover" />
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
                    <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept="image/*, video/mp4, video/webm"
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
                                <span className="text-[10px] text-slate-400 font-medium text-center px-1">Add Media</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button
                    type="submit"
                    disabled={isSaving || !form.productImage}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingProduct ? "Update Product" : "Save Product"}
                </button>
            </div>
        </div>
    );
}