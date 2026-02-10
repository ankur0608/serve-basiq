'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    FaWrench, FaTruck, FaPaintRoller, FaBroom,
    FaComputer, FaCamera, FaArrowRight, FaCouch, FaLightbulb, FaTree
} from 'react-icons/fa6'; // Added more icons for variety
import { LayoutGrid } from 'lucide-react';

// ✅ Updated Interface to match your API response
interface CategoryData {
    id: string;
    name: string;
    image?: string | null; // Changed from icon to image
    type?: string;
    children?: any[];
}

interface CategoryGridProps {
    type?: 'SERVICE' | 'RENTAL' | 'PRODUCT';
    title?: string;
    subtitle?: string;
}

// Extended Icon Map for visual variety when images are null
const ICONS = [
    FaWrench,       // 0: General / Repair
    FaTruck,        // 1: Logistics / Moving
    FaComputer,     // 2: Electronics / IT
    FaPaintRoller,  // 3: Home Improvement
    FaCamera,       // 4: Photography / Events
    FaBroom,        // 5: Cleaning
    FaCouch,        // 6: Furniture
    FaLightbulb,    // 7: Electrical
    FaTree          // 8: Gardening
];

const COLORS = [
    'bg-blue-50 text-blue-600',
    'bg-orange-50 text-orange-600',
    'bg-purple-50 text-purple-600',
    'bg-emerald-50 text-emerald-600',
    'bg-pink-50 text-pink-600',
    'bg-amber-50 text-amber-600',
    'bg-cyan-50 text-cyan-600',
    'bg-indigo-50 text-indigo-600'
];

export default function CategoryGrid({
    type = 'SERVICE',
    title = "Popular Categories",
    subtitle = "Explore top-rated services and rentals near you"
}: CategoryGridProps) {

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories', type, 'featured'],
        queryFn: async () => {
            const res = await fetch(`/api/categories?type=${type}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60, // 1 Hour
    });

    // Fetch enough for desktop (6), logic below handles mobile (4)
    const displayCategories = categories?.slice(0, 6) || [];

    if (isLoading) {
        return <CategorySkeleton />;
    }

    if (displayCategories.length === 0) return null;

    return (
        <section className="py-8 md:py-12 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="flex justify-between items-end mb-6 md:mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
                    </div>
                    <Link
                        href={'categories'}
                        className="hidden md:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                        View All <FaArrowRight size={12} />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {displayCategories.map((cat: CategoryData, index: number) => {

                        // Logic: Use API 'image' if available, otherwise fallback to mapped Icon
                        const hasImage = cat.image && cat.image.trim() !== "";
                        const Icon = ICONS[index % ICONS.length] || LayoutGrid;
                        const colorClass = COLORS[index % COLORS.length];

                        return (
                            <Link
                                key={cat.id}
                                href={`/${type === 'RENTAL' ? 'rentals' : 'services'}?category=${cat.id}`}
                                className={`
                                    group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 text-center
                                    ${index >= 4 ? 'hidden md:flex' : 'flex'} // 👈 Logic: Hide 5th & 6th item on Mobile
                                `}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-xl transition-transform group-hover:scale-110 duration-300 ${hasImage ? 'bg-transparent' : colorClass} overflow-hidden relative`}>
                                    {hasImage ? (
                                        // If image exists, show it
                                        <img
                                            src={cat.image || ""}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // If no image, show fallback Icon
                                        <Icon />
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight h-[2.5em] flex items-center justify-center">
                                    {cat.name}
                                </h3>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile "View All" Button */}
                <div className="mt-6 md:hidden">
                    <Link
                        href={'categories'}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                        View All Categories <FaArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// --- SKELETON COMPONENT ---
function CategorySkeleton() {
    return (
        <section className="py-8 md:py-12 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex justify-between items-end mb-6">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`h-32 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-3 animate-pulse ${i >= 4 ? 'hidden md:flex' : 'flex'}`}>
                            <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}