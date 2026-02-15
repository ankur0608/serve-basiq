'use client';

import { useUIStore } from '@/lib/store';
import { FaArrowLeft, FaCalendarCheck, FaMagnifyingGlass } from 'react-icons/fa6';
import Link from 'next/link';
import ActivityTabs from '@/components/profile/ActivityTabs';
import { useActiveBookings } from '@/app/hook/useProfileQueries'; // ✅ Import the hook

export default function MyBookingsPage() {
    const { currentUser } = useUIStore();

    // ✅ Use React Query Hook
    const { data: bookings = [], isLoading } = useActiveBookings();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Glassmorphism Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="p-2 -ml-2 hover:bg-slate-100/80 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">My Bookings</h1>
                            {!isLoading && (
                                <p className="text-xs text-slate-500 font-medium">
                                    Manage your appointments & rentals
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {isLoading ? (
                    <BookingSkeleton />
                ) : bookings.length > 0 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <FaCalendarCheck className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Active Activities</p>
                                    <h3 className="text-3xl font-bold">{bookings.length}</h3>
                                </div>
                            </div>
                        </div>

                        {/* List Container */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <ActivityTabs data={bookings} type="bookings" />
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title="No Bookings Found"
                        description="You haven't booked any services, products, or rentals yet."
                        actionLink="/services"
                        actionText="Explore Marketplace"
                    />
                )}
            </main>
        </div>
    );
}

// --- Sub-components (Same as before) ---

function BookingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg" />
                        <div className="flex-1 space-y-2 py-2">
                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                            <div className="h-3 bg-slate-100 rounded w-1/4 mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ title, description, actionLink, actionText }: any) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FaMagnifyingGlass className="text-slate-300 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-xs mb-8 leading-relaxed">{description}</p>
            <Link
                href={actionLink}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition shadow-lg active:scale-95"
            >
                {actionText}
            </Link>
        </div>
    );
}