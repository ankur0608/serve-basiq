import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { UploadCloud, Loader2, Trash2, Plus, PlayCircle, FileVideo, Save } from 'lucide-react';
import { ProductForm } from './AddProductView';
import imageCompression from 'browser-image-compression';

interface Step2Props {
    form: ProductForm;
    uploading: boolean;
    activeUploadField: 'main' | 'productImages' | 'gallery' | null;
    handleMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProductImagesUpload: (files: File[]) => void;
    removeProductImage: (index: number) => void;
    handleGalleryUpload: (files: File[]) => void;
    removeGalleryImg: (index: number) => void;
    setStep: (step: number) => void;
    isSaving: boolean;
    editingProduct?: any;
}

// ✅ Added File Size Constants to match backend
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export function Step2Media({
    form,
    uploading,
    activeUploadField,
    handleMainImageUpload,
    handleProductImagesUpload,
    removeProductImage,
    handleGalleryUpload,
    removeGalleryImg,
    setStep,
    isSaving,
    editingProduct
}: Step2Props) {
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    const [errors, setErrors] = useState<{ main?: string; angles?: string; gallery?: string }>({});

    const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp" as const
    };

    const isVideo = (url: string) => url.match(/\.(mp4|webm)$/i) || url.includes('video');

    const handleMainChangeWrapper = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Check main image size
        if (file.size > MAX_IMAGE_SIZE) {
            setErrors(prev => ({ ...prev, main: "Image exceeds 5MB limit. Please select a smaller file." }));
            return;
        }

        setErrors(prev => ({ ...prev, main: undefined }));

        try {
            const compressedBlob = await imageCompression(file, compressionOptions);
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([compressedBlob], newFileName, { type: 'image/webp' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);
            const syntheticEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;

            handleMainImageUpload(syntheticEvent);
        } catch (error) {
            handleMainImageUpload(e);
        }
    };

    const handleProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let hasSizeError = false;
        setErrors(prev => ({ ...prev, angles: undefined }));

        const fileArray = Array.from(files);
        const processedFiles: File[] = [];

        for (const file of fileArray) {
            // ✅ Check product angle image sizes
            if (file.size > MAX_IMAGE_SIZE) {
                hasSizeError = true;
                continue; // Skip the oversized file
            }

            if (file.type.startsWith('image/')) {
                try {
                    const compressedBlob = await imageCompression(file, compressionOptions);
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    processedFiles.push(new File([compressedBlob], newFileName, { type: 'image/webp' }));
                } catch (err) {
                    processedFiles.push(file);
                }
            }
        }

        if (hasSizeError) {
            setErrors(prev => ({ ...prev, angles: "One or more images skipped. Max size is 5MB." }));
        }

        if (processedFiles.length > 0) {
            handleProductImagesUpload(processedFiles);
        }
    };

    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let sizeErrorMessage = "";
        setErrors(prev => ({ ...prev, gallery: undefined }));

        const currentVideos = form.gallery.filter(isVideo).length;
        const currentImages = form.gallery.length - currentVideos;

        let addedImages = 0;
        let addedVideos = 0;

        const fileArray = Array.from(files);
        const processedFiles: File[] = [];

        for (const file of fileArray) {
            // ✅ Check Gallery file sizes based on type
            if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
                sizeErrorMessage = "Some images were skipped (Max 5MB).";
                continue;
            }
            if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
                sizeErrorMessage = sizeErrorMessage ? "Some files were skipped due to size limits." : "Some videos were skipped (Max 50MB).";
                continue;
            }

            if (file.type.startsWith('image/')) {
                if (currentImages + addedImages >= 45) continue;
                try {
                    const compressedBlob = await imageCompression(file, compressionOptions);
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    processedFiles.push(new File([compressedBlob], newFileName, { type: 'image/webp' }));
                    addedImages++;
                } catch (err) { processedFiles.push(file); addedImages++; }
            } else if (file.type.startsWith('video/')) {
                if (currentVideos + addedVideos >= 5) continue;
                processedFiles.push(file);
                addedVideos++;
            }
        }

        if (sizeErrorMessage) {
            setErrors(prev => ({ ...prev, gallery: sizeErrorMessage }));
        }

        if (processedFiles.length > 0) handleGalleryUpload(processedFiles);
    };

    const handleSaveValidation = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newErrors: { main?: string; angles?: string; gallery?: string } = {};
        let hasError = false;

        if (!form.productImage) {
            newErrors.main = "Main product image is required.";
            hasError = true;
        }
        if (!form.productImages || form.productImages.length === 0) {
            newErrors.angles = "Please add at least one product angle.";
            hasError = true;
        }
        if (!form.gallery || form.gallery.length === 0) {
            newErrors.gallery = "Please add at least one item to the gallery.";
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
            setErrors(newErrors);
        } else {
            setErrors({});
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* 1. MAIN PRODUCT IMAGE SLOT */}
            <div>
                <label className={labelClass}>Main Product Image (Max 5MB) <span className="text-red-500">*</span></label>
                <div className={`relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed overflow-hidden flex flex-col items-center justify-center group transition-colors ${errors.main ? 'border-red-400' : 'border-slate-200 hover:border-blue-300'}`}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainChangeWrapper}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                    />
                    {form.productImage ? (
                        <AppImage src={form.productImage} alt="Product Cover" type="card" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-slate-400">
                            <UploadCloud className="mx-auto mb-2" size={24} />
                            <span className="text-xs font-bold">Click to Upload Cover Image</span>
                        </div>
                    )}
                    {uploading && activeUploadField === 'main' && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
                {/* ✅ Main Image Error Message */}
                {errors.main && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.main}</p>}
            </div>

            {/* 2. PRODUCT IMAGES (EXTRA ANGLES) */}
            <div>
                <label className={labelClass}>Product Angles (Max 5 | Max 5MB each) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-5 gap-2">
                    {form.productImages.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200">
                            <AppImage src={url} alt={`Angle ${i + 1}`} type="thumbnail" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeProductImage(i)}
                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-10"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}

                    {form.productImages.length < 5 && (
                        <div className={`relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer ${errors.angles ? 'border-red-400' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple={true}
                                onChange={handleProductImagesChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={uploading}
                            />
                            {uploading && activeUploadField === 'productImages' ? (
                                <Loader2 className="animate-spin text-blue-400" size={20} />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <UploadCloud className="text-slate-400 mb-1" size={20} />
                                    <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">Add<br />Angle</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* ✅ Angles Error Message */}
                {errors.angles && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.angles}</p>}
            </div>

            {/* 3. GALLERY MEDIA */}
            <div>
                <label className={labelClass}>Gallery Media (Images: Max 5MB | Videos: Max 50MB) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                    {form.gallery.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-black">
                            {isVideo(url) ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                    <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none"><PlayCircle size={24} fill="rgba(0,0,0,0.5)" /></div>
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1"><FileVideo size={10} /> VIDEO</div>
                                </>
                            ) : (
                                <AppImage src={url} alt={`Gallery ${i}`} type="thumbnail" className="w-full h-full object-cover" />
                            )}
                            <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-10"><Trash2 size={10} /></button>
                        </div>
                    ))}

                    {form.gallery.length < 50 && (
                        <div className={`relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer ${errors.gallery ? 'border-red-400' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input type="file" accept="image/*, video/mp4, video/webm" multiple={true} onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={uploading} />
                            {uploading && activeUploadField === 'gallery' ? (<Loader2 className="animate-spin text-blue-400" size={16} />) : (<div className="flex flex-col items-center"><Plus className="text-slate-400" size={20} /><span className="text-[10px] text-slate-400 font-medium text-center px-1">Add Media</span></div>)}
                        </div>
                    )}
                </div>
                {/* ✅ Gallery Error Message */}
                {errors.gallery && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.gallery}</p>}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button
                    type="submit"
                    onClick={handleSaveValidation}
                    disabled={isSaving}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingProduct ? "Update Product" : "Save Product"}
                </button>
            </div>
        </div>
    );
}