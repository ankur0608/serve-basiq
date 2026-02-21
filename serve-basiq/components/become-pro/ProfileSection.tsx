import { memo } from "react";
import { Camera, Loader2 } from 'lucide-react';
import AppImage from "@/components/ui/AppImage";

interface ProfileSectionProps {
    imgPreview: string | null;
    uploading: boolean;
    error?: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileSection = memo(({ imgPreview, uploading, error, onUpload }: ProfileSectionProps) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
        <div className="relative w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition group">
            <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={uploading}
            />
            {uploading ? (
                <Loader2 className="animate-spin text-blue-500" size={32} />
            ) : imgPreview ? (
                <AppImage
                    src={imgPreview}
                    alt="Profile Preview"
                    type="avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <Camera className="text-slate-400 group-hover:text-blue-500 transition" size={32} />
            )}
        </div>
        <p className={`text-xs font-bold uppercase mt-3 ${error ? 'text-red-600' : 'text-slate-400'}`}>
            {uploading ? "Compressing & Uploading..." : (error || "Upload Profile Photo")}
        </p>
    </div>
));

ProfileSection.displayName = "ProfileSection";
export default ProfileSection;