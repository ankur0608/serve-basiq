'use client';

import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { FaPhone, FaRightFromBracket, FaPencil, FaBriefcase, FaGaugeHigh, FaXmark, FaCamera, FaSpinner } from 'react-icons/fa6';
import clsx from 'clsx';
import Image from 'next/image';
import { fullLogout } from '@/lib/logout';
import { useState, useRef } from 'react';

// --- INTERNAL COMPONENT: EDIT MODAL ---
const EditProfileModal = ({
    isOpen, onClose, currentName, currentImage, onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentImage: string | null;
    onSave: (name: string, file: File | null) => Promise<void>;
}) => {
    const [name, setName] = useState(currentName);
    const [preview, setPreview] = useState<string | null>(currentImage);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        await onSave(name, file);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-900">Edit Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                        <FaXmark className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Image Upload */}
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative">
                            {preview ? (
                                <Image src={preview} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                    {name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <FaCamera className="text-white text-xl" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Name Input */}
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Enter your name"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition flex items-center justify-center gap-2"
                    >
                        {loading && <FaSpinner className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface ProfileHeaderProps {
    onEditClick?: () => void; // Optional now, since we handle it internally by default
    userImage?: string | null;
    onLogout?: () => void;
    hideEditButton?: boolean;
}

export default function ProfileHeader({ onEditClick, userImage, onLogout, hideEditButton }: ProfileHeaderProps) {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useUIStore();
    const { data: session, update: updateSession } = useSession();
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    // ✅ COMBINED CHECK
    const isWorker = currentUser?.isWorker || session?.user?.isWorker || false;
    const displayName = currentUser?.name || session?.user?.name || "User";
    const displayImage = userImage || currentUser?.img || session?.user?.image;
    const displayPhone = currentUser?.phone || session?.user?.phone;

    // Logic: If onEditClick is passed, use it. Otherwise, use internal modal.
    const handleEditTrigger = () => {
        if (onEditClick) {
            onEditClick();
        } else {
            setEditModalOpen(true);
        }
    };

    // Logic: Save changes to API
    const handleSaveChanges = async (newName: string, newFile: File | null) => {
        try {
            let uploadedImageUrl = displayImage;

            // 1. Upload Image if changed
            if (newFile) {
                const formData = new FormData();
                formData.append('file', newFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedImageUrl = data.url;
                }
            }

            // 2. Update User Profile
            const updateRes = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser?.id || session?.user?.id,
                    name: newName,
                    image: uploadedImageUrl
                })
            });

            if (updateRes.ok) {
                // 3. Update Local State & Session
                const updatedUser = { ...currentUser!, name: newName, img: uploadedImageUrl };
                setCurrentUser(updatedUser as any);
                await updateSession({ name: newName, image: uploadedImageUrl });
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    if (!currentUser && !session) return null;

    const getInitials = () => displayName.substring(0, 2).toUpperCase();

    const handleProviderClick = () => {
        if (isWorker) {
            router.push('/provider/dashboard');
        } else {
            router.push('/become-pro');
        }
    };

    const handleInternalLogout = async () => {
        await fullLogout();
    };

    return (
        <>
            <div className={clsx("pt-12 pb-24 px-4 relative overflow-hidden transition-colors duration-500", isWorker ? "bg-slate-900 text-white" : "bg-blue-600 text-white")}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-white/10 overflow-hidden relative">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt="Profile"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 96px"
                                priority
                            />
                        ) : (
                            <span>{getInitials()}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 mb-2">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold">{displayName}</h1>

                            {/* ✅ PENCIL BUTTON NOW TRIGGERS MODAL */}
                            {!hideEditButton && (
                                <button
                                    onClick={handleEditTrigger}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm cursor-pointer"
                                    title="Edit Profile"
                                >
                                    <FaPencil className="text-sm" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/70 text-sm font-medium">
                            {displayPhone && (
                                <>
                                    <span className="flex items-center gap-1.5"><FaPhone className="text-xs" /> {displayPhone}</span>
                                    <span className="hidden md:inline w-1 h-1 bg-white/40 rounded-full"></span>
                                </>
                            )}
                            <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", isWorker ? "bg-green-400/20 text-green-100 border-green-400/30" : "bg-white/20 text-white border-white/30")}>
                                {isWorker ? "Professional" : "Customer"}
                            </span>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleProviderClick}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm shadow-lg border",
                                isWorker
                                    ? "bg-green-500 text-white border-green-400 hover:bg-green-600"
                                    : "bg-white text-blue-600 border-white hover:bg-blue-50"
                            )}
                        >
                            {isWorker ? <><FaGaugeHigh /> Dashboard</> : <><FaBriefcase /> Become a Pro</>}
                        </button>

                        <button
                            onClick={handleInternalLogout}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm"
                        >
                            <FaRightFromBracket />
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ EDIT MODAL COMPONENT */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                currentName={displayName}
                currentImage={displayImage || null}
                onSave={handleSaveChanges}
            />
        </>
    );
}