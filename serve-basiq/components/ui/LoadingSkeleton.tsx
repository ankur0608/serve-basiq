import React from 'react';
import Skeleton from './Skeleton';

export default function LoadingSkeleton() {
    return (
        <div className="pb-20 bg-slate-50 min-h-screen pt-4 md:pt-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Back Button Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-40 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ================= LEFT COLUMN ================= */}
                    <div className="lg:col-span-2 space-y-8 order-1">
                        <div className="space-y-4">
                            {/* Tags Skeleton */}
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-32 rounded-full" />
                            </div>

                            {/* Title Skeleton */}
                            <Skeleton className="h-12 md:h-14 w-3/4 rounded-2xl" />

                            {/* Location Skeleton */}
                            <Skeleton className="h-6 w-1/2 rounded-lg" />
                        </div>

                        {/* Main Image Gallery Skeleton */}
                        <Skeleton className="w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl" />

                        {/* Thumbnail Skeletons */}
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shrink-0" />
                            ))}
                        </div>

                        {/* Description Box Skeleton */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <Skeleton className="h-8 w-56 rounded-lg mb-6 bg-slate-100" />

                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full rounded-md bg-slate-100" />
                                <Skeleton className="h-4 w-full rounded-md bg-slate-100" />
                                <Skeleton className="h-4 w-5/6 rounded-md bg-slate-100" />
                                <Skeleton className="h-4 w-4/6 rounded-md bg-slate-100" />
                            </div>

                            {/* Stats Boxes Skeleton */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-24 rounded-2xl bg-slate-50 border border-slate-100" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN ================= */}
                    <div className="space-y-6 order-2 h-fit lg:top-24 z-20">
                        {/* Pricing Skeleton */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mt-2">
                            <Skeleton className="h-4 w-24 rounded-md mb-3 bg-slate-100" />
                            <Skeleton className="h-12 w-48 rounded-xl mb-6" />

                            <div className="space-y-4 mb-6">
                                <Skeleton className="h-16 w-full rounded-xl border border-slate-100 bg-slate-50" />
                                <Skeleton className="h-24 w-full rounded-2xl border border-slate-100 bg-slate-50" />
                            </div>

                            {/* Booking Button Skeleton */}
                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>

                        {/* Business Hours Skeleton */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <Skeleton className="h-5 w-32 rounded-md mb-4 bg-slate-100" />
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-4 w-16 rounded-md bg-slate-100" />
                                <Skeleton className="h-4 w-24 rounded-md" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-14 rounded-md bg-slate-100" />
                                <Skeleton className="h-6 w-14 rounded-md bg-slate-100" />
                                <Skeleton className="h-6 w-14 rounded-md bg-slate-100" />
                            </div>
                        </div>

                        {/* Supplier Profile Skeleton */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <Skeleton className="h-5 w-36 rounded-md mb-4 bg-slate-100" />
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4 rounded-md" />
                                    <Skeleton className="h-4 w-1/3 rounded-md bg-slate-100" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full border border-slate-100 rounded-xl bg-slate-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
