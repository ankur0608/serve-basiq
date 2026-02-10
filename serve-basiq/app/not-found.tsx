import Link from 'next/link';
import { FaMagnifyingGlass, FaHouse } from 'react-icons/fa6';
import { Map, FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Icon Container - Responsive Sizing */}
                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
                    <div className="relative bg-white p-4 sm:p-6 rounded-full shadow-xl border border-slate-100 w-full h-full flex items-center justify-center">
                        <Map className="text-blue-600 w-10 h-10 sm:w-12 sm:h-12" />
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-full border-4 border-white">
                            <FileQuestion size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                        404
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700">
                        We lost that page...
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                {/* Actions - Stack on mobile, Row on Desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <FaHouse /> Go Home
                    </Link>

                    <Link
                        href="/products"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition active:scale-95"
                    >
                        <FaMagnifyingGlass /> Browse Products
                    </Link>
                </div>

                {/* Helpful Footer Links */}
                <div className="pt-6 sm:pt-8 border-t border-slate-200 mt-6 sm:mt-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 sm:mb-4">
                        Popular Destinations
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-blue-600">
                        <Link href="/products" className="hover:underline">Marketplace</Link>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <Link href="/services" className="hover:underline">Services</Link>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <Link href="/profile" className="hover:underline">My Account</Link>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <Link href="/support" className="hover:underline">Help Center</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}