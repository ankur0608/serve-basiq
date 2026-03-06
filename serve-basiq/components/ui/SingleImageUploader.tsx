'use client';

import { Loader2, Camera, UploadCloud } from 'lucide-react';
import { useImageUpload } from "@/app/hook/useImageUpload";

interface SingleImageUploaderProps {
    label: string;
    image: string;
    onChange: (url: string) => void;
    aspect?: 'video' | 'banner';
    required?: boolean;
}

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

export const SingleImageUploader = ({
    label,
    image,
    onChange,
    aspect = "video",
    required = false
}: SingleImageUploaderProps) => {

    const { isUploading, handleImageUpload, uploadError } = useImageUpload({
        onUploadSuccess: (key, url) => onChange(url)
    });

    const heightClass = aspect === 'banner' ? 'h-32' : 'aspect-video';

    return (
        <div>
            <label className={labelClass}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className={`relative ${heightClass} rounded-xl bg-slate-50 border-2 border-dashed ${uploadError ? 'border-red-400 bg-red-50' : 'border-slate-300'} overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer`}>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />

                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                        <span className="text-xs font-bold text-blue-600">Uploading...</span>
                    </div>
                )}

                {image ? (
                    <>
                        <img src={image} className="w-full h-full object-cover" alt="Uploaded content" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                            <p className="text-white text-xs font-bold flex items-center gap-2">
                                <Camera size={16} /> Change Photo
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <UploadCloud className="mx-auto mb-2" size={32} />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {uploadError ? "Upload Failed" : "Click to Upload"}
                        </span>
                        {uploadError && <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};