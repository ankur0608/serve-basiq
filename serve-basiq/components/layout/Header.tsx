"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaMagnifyingGlass, FaRegBell, FaXmark } from "react-icons/fa6";
import { useUIStore } from "@/lib/store";
import AppImage from "@/components/ui/AppImage";

const Navbar = () => {
    const { status } = useSession();
    const router = useRouter();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const openLogin = useUIStore((state) => state.onOpenLogin);
    const currentUser = useUIStore((state) => state.currentUser);

    const isLoggedIn = status === "authenticated" && !!currentUser;

    const getUserImage = () => {
        if (!currentUser) return null;
        return currentUser.img || (currentUser as any).profileImage || null;
    };

    const getInitials = () => {
        if (currentUser?.name) return currentUser.name[0].toUpperCase();
        return "U";
    };

    const userImageSrc = getUserImage();

    // Form submission handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowMobileSearch(false);
        }
    };

    // Clear search input handler
    const handleClearSearch = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        setSearchQuery("");
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <nav className="mx-auto max-w-7xl px-4">

                {/* --- MOBILE VIEW --- */}
                <div className="flex md:hidden items-center justify-between h-14">
                    <Link href="/" className="flex items-center">
                        <Image src="/navbar.png" alt="Servebasiq Logo" width={170} height={50} priority className="h-18 w-auto" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowMobileSearch(true)} className="p-2 rounded-full hover:bg-gray-100 transition">
                            <FaMagnifyingGlass className="text-gray-600" />
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <FaRegBell className="text-gray-600" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        {isLoggedIn ? (
                            <Link href="/profile">
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-gray-100 overflow-hidden relative">
                                    {userImageSrc ? (
                                        <AppImage src={userImageSrc} alt={currentUser.name || "User"} type="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{getInitials()}</span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <button onClick={openLogin} className="px-4 h-9 flex items-center rounded-full bg-slate-900 text-white text-xs font-bold">
                                Login
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ MOBILE SEARCH EXPANDED */}
                {showMobileSearch && (
                    <div className="md:hidden pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <form onSubmit={handleSearch} className="relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Services, Products..."
                                className="w-full h-11 pl-11 pr-20 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* Clear Button (Only shows when there is text) */}
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FaXmark size={14} />
                                    </button>
                                )}

                                {/* Close Mobile Search Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMobileSearch(false)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors border-l border-gray-300 ml-1 pl-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- DESKTOP VIEW --- */}
                <div className="hidden md:flex items-center justify-between h-16 gap-4">
                    <Link href="/" className="flex items-center shrink-0">
                        <Image src="/navbar.png" alt="Servebasiq Logo" width={190} height={100} priority className="h-22 w-auto" />
                    </Link>

                    {/* ✅ DESKTOP SEARCH BAR */}
                    <div className="flex-1 max-w-lg">
                        <form onSubmit={handleSearch} className="relative group">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Services, Products or Rentals..."
                                className="w-full h-11 pl-11 pr-10 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm group-focus-within:shadow-md"
                            />

                            {/* Clear Button (Only shows when there is text) */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FaXmark size={16} />
                                </button>
                            )}

                            {/* Hidden submit button to allow Enter key to work */}
                            <button type="submit" className="hidden">Search</button>
                        </form>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                            <Link href="/services" className="hover:text-blue-600 transition">Services</Link>
                            <Link href="/products" className="hover:text-blue-600 transition">Products</Link>
                            <Link href="/rentals" className="hover:text-blue-600 transition">Rentals</Link>
                            <Link href="/categories" className="hover:text-blue-600 transition">Categories</Link>
                        </div>

                        <Link href="/post-requirement" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">
                            Post Request
                        </Link>

                        {isLoggedIn ? (
                            <Link href="/profile" className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                                <div className="text-right hidden lg:block">
                                    <div className="text-xs font-bold text-slate-900">{currentUser.name || "User"}</div>
                                    <div className="text-[10px] text-gray-500">{currentUser.isWorker ? "Professional" : "Customer"}</div>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden relative border border-gray-100">
                                    {userImageSrc ? (
                                        <AppImage src={userImageSrc} alt={currentUser.name || "User"} type="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{getInitials()}</span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <button onClick={openLogin} className="px-6 h-10 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-black transition shadow-sm hover:shadow-md">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;