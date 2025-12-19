"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    FaMagnifyingGlass,
    FaRegBell,
    FaGlobe,
    FaHandshakeSimple,
    FaXmark,
} from "react-icons/fa6";
import { useUIStore } from "@/lib/store";

const Navbar = () => {
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const openLogin = useUIStore((state) => state.onOpenLogin);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <nav className="mx-auto max-w-7xl px-4">

                {/* ================= MOBILE TOP BAR ================= */}
                <div className="flex md:hidden items-center justify-between h-14">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            <FaHandshakeSimple className="text-white text-lg" />
                        </div>
                        <span className="text-lg font-extrabold text-slate-900">
                            Serve<span className="text-blue-600">Mate</span>
                        </span>
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

                        <button
                            onClick={openLogin}
                            className="px-4 h-9 flex items-center rounded-full bg-slate-900 text-white text-xs font-bold"
                        >
                            Login
                        </button>
                    </div>
                </div>

                {/* ================= MOBILE SEARCH ================= */}
                {showMobileSearch && (
                    <div className="md:hidden pb-3">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search Services, Products or Suppliers..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl bg-gray-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

                {/* ================= DESKTOP NAV ================= */}
                <div className="hidden md:flex items-center justify-between h-16 gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            <FaHandshakeSimple className="text-white text-lg" />
                        </div>
                        <span className="text-xl font-extrabold text-slate-900">
                            Serve<span className="text-blue-600">Mate</span>
                        </span>
                    </Link>

                    <div className="flex-1 max-w-lg">
                        <div className="relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Services, Products or Suppliers..."
                                className="w-full h-11 pl-11 pr-4 rounded-full bg-slate-50 border border-gray-200
                text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-gray-600">
                            <FaGlobe /> EN
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <FaRegBell className="text-gray-600" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        <Link href="/post-request" className="text-sm font-bold text-gray-600 hover:text-blue-600">
                            Post Request
                        </Link>

                        <button
                            onClick={openLogin}
                            className="px-6 h-10 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-black"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
