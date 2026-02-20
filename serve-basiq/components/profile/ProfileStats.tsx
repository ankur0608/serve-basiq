'use client';

import Link from 'next/link';
import { useUserStats, useFavoritesDetails } from '@/app/hook/useProfileQueries';
import {
    FaCalendarCheck,
    FaHeart,
    FaBan
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function ProfileStats() {
    const { data: statsData, isLoading: isStatsLoading } = useUserStats();
    const { data: favData, isLoading: isFavLoading } = useFavoritesDetails();

    // ✅ Calculations include Rentals
    const favoriteCount =
        (favData?.services?.length || 0) +
        (favData?.products?.length || 0) +
        (favData?.rentals?.length || 0);

    const bookingCount = statsData?.bookings || 0;
    const cancellationCount = statsData?.cancellations || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {/* Card 1: Bookings */}
                <StatCard
                    href="/profile/bookings"
                    icon={FaCalendarCheck}
                    value={isStatsLoading ? "..." : bookingCount}
                    label="Bookings"
                    color="bg-blue-50 text-blue-600"
                />

                {/* Card 2: Favourites */}
                <StatCard
                    href="/favorites"
                    icon={FaHeart}
                    value={isFavLoading ? "..." : favoriteCount}
                    label="Favourites"
                    color="bg-pink-50 text-pink-600"
                />

                {/* Card 3: Cancellations */}
                <StatCard
                    href="/profile/cancellations"
                    icon={FaBan}
                    value={isStatsLoading ? "..." : cancellationCount}
                    label="Cancellations"
                    color="bg-red-50 text-red-600"
                />
            </div>
        </div>
    );
}

// Reusable Card Component
function StatCard({ icon: Icon, value, label, color, href }: any) {
    return (
        <Link href={href || '#'} className="block h-full group">
            <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition duration-300 h-full">
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg transition-transform group-hover:scale-110",
                    color
                )}>
                    <Icon />
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {value}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {label}
                </div>
            </div>
        </Link>
    );
}