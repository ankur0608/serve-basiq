'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaArrowLeft, FaBan, FaCalendarXmark, FaLocationDot } from 'react-icons/fa6';
import AppImage from '@/components/ui/AppImage';

export default function CancellationsPage() {
    const router = useRouter();

    // Fetch Cancelled Bookings
    const { data: cancellations = [], isLoading } = useQuery({
        queryKey: ['bookings', 'cancelled'],
        queryFn: async () => {
            const res = await fetch('/api/user/bookings/cancelled');
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FaBan className="text-red-600" /> Cancelled Bookings
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : cancellations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCalendarCheck size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No Cancellations</h3>
                        <p className="text-slate-500 text-sm">You have a great completion record!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cancellations.map((item: any) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                    <AppImage
                                        src={item.service?.serviceimg || item.product?.productImage}
                                        alt="Thumbnail"
                                        type="thumbnail"
                                        className="w-full h-full object-cover grayscale" // Grayscale to indicate cancelled
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 uppercase tracking-wide">
                                                Cancelled
                                            </span>
                                            <h3 className="font-bold text-slate-800 mt-2 text-lg">
                                                {item.service?.name || item.product?.name || "Unknown Item"}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-400 line-through">
                                                ₹{item.service?.price || item.totalPrice}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <FaCalendarXmark />
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaLocationDot />
                                            {item.address?.city || "Online"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper icon import (if needed)
import { FaCalendarCheck } from 'react-icons/fa6';