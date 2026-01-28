'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import Link from 'next/link';
import ActivityTabs from '@/components/profile/ActivityTabs';

export default function MyBookingsPage() {
    const { currentUser } = useUIStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!currentUser?.id) return;
            try {
                // Assuming your API can filter or returns bookings in the profile object
                const res = await fetch(`/api/user/profile?identifier=${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data.bookings || []);
                }
            } catch (error) {
                console.error("Failed to load bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [currentUser?.id]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Simple Header */}
            <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">My Bookings</h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-2xl text-blue-500" /></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700">All Bookings</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{bookings.length} Total</span>
                        </div>
                        <ActivityTabs data={bookings} type="bookings" />
                    </div>
                )}
            </div>
        </div>
    );
}