'use client';

import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react'; // ✅ Import signOut
import { FaPhone, FaRightFromBracket, FaPencil, FaBriefcase, FaGaugeHigh } from 'react-icons/fa6';
import clsx from 'clsx';
import Image from 'next/image';

interface ProfileHeaderProps {
    onEditClick: () => void;
    userImage?: string | null;
    onLogout?: () => void; // ✅ New optional prop
}

export default function ProfileHeader({ onEditClick, userImage, onLogout }: ProfileHeaderProps) {
    const router = useRouter();
    const { currentUser, logout: storeLogout } = useUIStore();
    const { data: session } = useSession();

    if (!currentUser) return null;

    const isWorker = currentUser.isWorker;
    const displayImage = userImage || currentUser?.img || session?.user?.image;

    const getInitials = () => {
        const name = currentUser.name || session?.user?.name || "User";
        return name.substring(0, 2).toUpperCase();
    };

    const handleProviderClick = () => {
        if (isWorker) {
            router.push('/provider/dashboard');
        } else {
            router.push('/become-pro');
        }
    };

    // ✅ Fallback internal logout if prop isn't passed
    const handleInternalLogout = async () => {
        if (onLogout) {
            onLogout();
            return;
        }

        storeLogout(); // UI Store clear
        await fetch('/api/user/logout', { method: 'POST' }); // API Clear
        await signOut({ redirect: false }); // NextAuth Clear
        router.push('/');
    };

    return (
        <div className={clsx("pt-12 pb-24 px-4 relative overflow-hidden transition-colors duration-500", isWorker ? "bg-slate-900 text-white" : "bg-blue-600 text-white")}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                {/* Avatar Section */}
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
                        <h1 className="text-3xl font-extrabold">{currentUser.name || session?.user?.name || "Hello, User"}</h1>
                        <button onClick={onEditClick} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm cursor-pointer" title="Edit Profile">
                            <FaPencil className="text-sm" />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/70 text-sm font-medium">
                        {currentUser.phone && (
                            <>
                                <span className="flex items-center gap-1.5"><FaPhone className="text-xs" /> {currentUser.phone}</span>
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

                    {/* ✅ Uses unified logout logic */}
                    <button
                        onClick={handleInternalLogout}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm"
                    >
                        <FaRightFromBracket />
                    </button>
                </div>
            </div>
        </div>
    );
}   