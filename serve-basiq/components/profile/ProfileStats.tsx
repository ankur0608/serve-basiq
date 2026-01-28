'use client';

import Link from 'next/link';
import { useUIStore } from '@/lib/store';
import {
    FaWallet,
    FaCalendarCheck,
    FaBriefcase,
    FaHeart,
    FaStar,
    FaBoxOpen,
    FaCircleExclamation
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function ProfileStats() {
    const isWorker = useUIStore(
        state => state.currentUser?.isWorker
    );

    const isVerified = useUIStore(
        state => state.currentUser?.isVerified
    );

    if (isWorker === undefined) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                <StatCard
                    icon={isWorker ? FaWallet : FaCalendarCheck}
                    value={isWorker ? "₹12k" : "2"}
                    label={isWorker ? "Earnings" : "Orders"}
                    color={isWorker ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}
                />

                <StatCard
                    icon={isWorker ? FaBriefcase : FaHeart}
                    value={isWorker ? "5" : "14"}
                    label={isWorker ? "Jobs" : "Saved"}
                    color={isWorker ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"}
                />

                <StatCard
                    icon={isWorker ? FaStar : FaBoxOpen}
                    value={isWorker ? "4.8" : "0"}
                    label={isWorker ? "Rating" : "Returns"}
                    color={isWorker ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"}
                />
            </div>

            {/* {!isWorker && (
                <Link href="/become-pro" className="block relative group cursor-pointer">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">
                                Become a Service Provider
                            </h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Earn money by offering your skills.
                            </p>
                            <span className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2">
                                <FaBriefcase /> Apply Now
                            </span>
                        </div>

                        <FaBriefcase className="absolute -right-6 -bottom-6 text-9xl text-white/5 transform rotate-12" />
                    </div>
                </Link>
            )}

            {isWorker && !isVerified && (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl">
                        <FaCircleExclamation />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-900">
                            Verification Pending
                        </h3>
                        <p className="text-sm text-orange-700 mt-1">
                            Your profile is hidden until approved.
                        </p>
                    </div>
                </div>
            )} */}
        </div>
    );
}

function StatCard({ icon: Icon, value, label, color }: any) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition duration-300">
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
    );
}
