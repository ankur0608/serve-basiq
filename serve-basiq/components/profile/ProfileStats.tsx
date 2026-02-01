'use client';

import Link from 'next/link';
import { useUIStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import {
    FaCalendarCheck,
    FaHeart,
    FaBan
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function ProfileStats() {
    const currentUser = useUIStore(state => state.currentUser);

    // ✅ Query 1: Get Favorites count
    const { data: favData, isLoading: isFavLoading } = useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            return res.json();
        },
        enabled: !!currentUser,
        staleTime: 0,
    });

    // ✅ Query 2: Get User Stats
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['user', 'stats'],
        queryFn: async () => {
            const res = await fetch('/api/user/stats');
            if (!res.ok) return { bookings: 0, cancellations: 0 };
            return res.json();
        },
        enabled: !!currentUser,
        staleTime: 0,
    });

    // Calculations
    const favoriteCount = (favData?.services?.length || 0) + (favData?.products?.length || 0);
    const bookingCount = statsData?.bookings || 0;
    const cancellationCount = statsData?.cancellations || 0;

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 md:gap-6">

                {/* Card 1: Bookings */}
                <StatCard
                    href="/profile/bookings" // ✅ Points to your existing Bookings page
                    icon={FaCalendarCheck}
                    value={isStatsLoading ? "..." : bookingCount}
                    label="Bookings"
                    color="bg-blue-50 text-blue-600"
                />

                {/* Card 2: Favourites */}
                <StatCard
                    href="/favorites" // ✅ Points to the new Favorites page
                    icon={FaHeart}
                    value={isFavLoading ? "..." : favoriteCount}
                    label="Favourites"
                    color="bg-pink-50 text-pink-600"
                />

                {/* Card 3: Cancellations */}
                <StatCard
                    href="/cancellations" // ✅ UPDATED: Points to the new Cancellations page
                    icon={FaBan}
                    value={isStatsLoading ? "..." : cancellationCount}
                    label="Cancellations"
                    color="bg-red-50 text-red-600"
                />
            </div>
        </div>
    );
}

// ✅ Updated Component to accept 'href'
function StatCard({ icon: Icon, value, label, color, href }: any) {
    return (
        <Link href={href || '#'} className="block h-full">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition duration-300 h-full">
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg",
                    color
                )}>
                    <Icon />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                    {value}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {label}
                </div>
            </div>
        </Link>
    );
}