"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
    FaMagnifyingGlass,
    FaRegBell,
    FaGlobe,
    FaXmark,
} from "react-icons/fa6";
import { useUIStore } from "@/lib/store";
import AppImage from "@/components/ui/AppImage";

const Navbar = () => {
    const { status } = useSession();
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const openLogin = useUIStore((state) => state.onOpenLogin);
    const currentUser = useUIStore((state) => state.currentUser);

    // ✅ CRITICAL: Unified login check
    const isLoggedIn = status === "authenticated" && !!currentUser;

    const getUserImage = () => {
        if (!currentUser) return null;
        // ✅ FIX: Cast to 'any' to access profileImage without TS error
        return currentUser.img || (currentUser as any).profileImage || null;
    };

    const getInitials = () => {
        if (currentUser?.name) return currentUser.name[0].toUpperCase();
        return "U";
    };

    const userImageSrc = getUserImage();

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <nav className="mx-auto max-w-7xl px-4">

                {/* MOBILE VIEW */}
                <div className="flex md:hidden items-center justify-between h-14">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/navbar.png"
                            alt="Servebasiq Logo"
                            width={170}
                            height={50}
                            priority
                            className="h-24 w-auto"
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileSearch(true)}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <FaMagnifyingGlass className="text-gray-600" />
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <FaRegBell className="text-gray-600" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        {/* ✅ Conditional User Logic */}
                        {isLoggedIn ? (
                            <Link href="/profile">
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-gray-100 overflow-hidden relative">
                                    {userImageSrc ? (
                                        <AppImage
                                            src={userImageSrc}
                                            alt={currentUser.name || "User"}
                                            type="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{getInitials()}</span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <button
                                onClick={openLogin}
                                className="px-4 h-9 flex items-center rounded-full bg-slate-900 text-white text-xs font-bold"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>

                {showMobileSearch && (
                    <div className="md:hidden pb-3">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search Services, Products or Suppliers..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                                onClick={() => setShowMobileSearch(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                            >
                                <FaXmark className="text-gray-500 text-lg" />
                            </button>
                        </div>
                    </div>
                )}

                {/* DESKTOP VIEW */}
                <div className="hidden md:flex items-center justify-between h-16 gap-4">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/navbar.png"
                            alt="Servebasiq Logo"
                            width={190}
                            height={100}
                            priority
                            className="h-28 w-auto"
                        />
                    </Link>

                    <div className="flex-1 max-w-lg">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Services, Products or Suppliers..."
                                className="w-full h-11 pl-11 pr-4 rounded-full bg-slate-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                            <Link href="/services" className="hover:text-blue-600 transition">Services</Link>
                            <Link href="/products" className="hover:text-blue-600 transition">Products</Link>
                        </div>

                        <button className="flex items-center gap-1 text-sm text-gray-600">
                            <FaGlobe /> EN
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <FaRegBell className="text-gray-600" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        <Link
                            href="/post-requirement"
                            className="text-sm font-bold text-gray-600 hover:text-blue-600"
                        >
                            Post Request
                        </Link>

                        {/* ✅ Conditional User Logic */}
                        {isLoggedIn ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                            >
                                <div className="text-right hidden lg:block">
                                    <div className="text-xs font-bold text-slate-900">
                                        {currentUser.name || "User"}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {currentUser.isWorker ? "Professional" : "Customer"}
                                    </div>
                                </div>

                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden relative border border-gray-100">
                                    {userImageSrc ? (
                                        <AppImage
                                            src={userImageSrc}
                                            alt={currentUser.name || "User"}
                                            type="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{getInitials()}</span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <button
                                onClick={openLogin}
                                className="px-6 h-10 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
                            >
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