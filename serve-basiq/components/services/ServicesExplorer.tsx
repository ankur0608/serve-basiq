'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FaFire, FaArrowLeft, FaScrewdriverWrench } from 'react-icons/fa6';
import { SearchX } from 'lucide-react';
import ServiceCard from '@/components/ui/ServiceCard';
import AppImage from '@/components/ui/AppImage';
import { BiMap } from "react-icons/bi";

// Skeleton Component
function ExplorerSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded mb-10"></div>
            <div className="mb-12">
                <div className="h-4 w-32 bg-slate-200 rounded mb-5"></div>
                <div className="grid grid-cols-4 sm:hidden gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>)}
                </div>
                <div className="hidden sm:grid grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>)}
                </div>
            </div>
            <div>
                <div className="h-8 w-40 bg-slate-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-slate-200 rounded-3xl"></div>)}
                </div>
            </div>
        </div>
    );
}

export default function ServicesExplorer() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<string[]>([]);

    // 1️⃣ Query for User Favorites (Initial Load)
    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [] };
            const data = await res.json();
            // Update local state with fetched IDs
            setFavorites(data.services || []);
            return data;
        },
        staleTime: 0, // Always fetch fresh on mount
    });

    // 2️⃣ Query for Categories
    const { data: categories = [], isLoading: catLoading } = useQuery({
        queryKey: ['categories', 'SERVICE'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

    // 3️⃣ Query for Services
    const { data: rawServices = [], isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/services?limit=12');
            return res.json();
        },
        staleTime: 1000 * 60 * 1,
    });

    const services = Array.isArray(rawServices) ? rawServices.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category?.name || "General",
        price: Number(item.price) || 0,
        priceType: item.priceType,
        rating: 4.5,
        location: item.city || "Remote",
        image: item.serviceimg || item.mainimg || item.user?.profileImage || item.user?.image || "",
        isVerified: true
    })) : [];

    const loading = catLoading || servLoading;

    // Slices for different views
    const mobileCategories = categories.slice(0, 4);
    const webCategories = categories.slice(0, 6);

    // ✅ REAL API TOGGLE FUNCTION
    const handleToggleFav = async (id: string) => {
        // 1. Optimistic Update (Instant UI feedback)
        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];

        setFavorites(newFavorites);

        try {
            // 2. API Call
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'SERVICE' })
            });

            if (!res.ok) {
                throw new Error("Failed to update favorite");
            }
        } catch (error) {
            // 3. Rollback on Error
            console.error("Favorite toggle failed:", error);
            setFavorites(favorites); // Revert to previous state
            // toast.error("Could not update favorite"); 
        }
    };

    return (
        <section className="min-h-screen bg-[#F8F9FC] text-slate-800 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                {/* Header Section */}
                <div className="mb-10">
                    {!loading && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 rounded-full hover:bg-gray-100 text-slate-600 transition-colors -ml-2"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Services</h1>
                            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 pl-3 pr-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
                                <BiMap className="text-blue-600 text-lg" /> <span>Global</span>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? <ExplorerSkeleton /> : (
                    <div className="animate-in fade-in duration-500">

                        {/* --- CATEGORY SECTION --- */}
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Shop by Category</h2>
                                <Link href="/servicescategory" className="text-blue-600 text-xs font-bold uppercase hover:underline">View All</Link>
                            </div>

                            {/* MOBILE (4 Items) */}
                            <div className="grid grid-cols-4 gap-3 sm:hidden">
                                {mobileCategories.map((cat: any) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => router.push(`/servicescategory/${cat.id}`)}
                                        className="bg-white rounded-xl p-3 text-center shadow-sm border border-transparent hover:shadow-md hover:border-blue-200 cursor-pointer transition group"
                                    >
                                        <div className="w-9 h-9 bg-slate-50 rounded-lg mx-auto mb-2 group-hover:scale-105 transition overflow-hidden border border-slate-100 flex items-center justify-center">
                                            {cat.image ? (
                                                <AppImage
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    type="thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaScrewdriverWrench className="text-slate-400 text-sm" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600">{cat.name}</p>
                                    </div>
                                ))}
                            </div>

                            {/* WEB (6 Items) */}
                            <div className="hidden sm:grid grid-cols-3 md:grid-cols-6 gap-4">
                                {webCategories.map((cat: any) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => router.push(`/servicescategory/${cat.id}`)}
                                        className="bg-white rounded-xl p-4 text-center shadow-sm border border-transparent hover:shadow-md hover:border-blue-200 cursor-pointer transition group"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg mx-auto mb-3 group-hover:scale-105 transition overflow-hidden border border-slate-100 flex items-center justify-center">
                                            {cat.image ? (
                                                <AppImage
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    type="thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaScrewdriverWrench className="text-slate-400 text-lg" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold uppercase text-slate-700 group-hover:text-blue-600 line-clamp-1">{cat.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FaFire className="text-orange-500 animate-pulse" /> Popular Near You</h3>
                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{services.length} Services Found</div>
                        </div>

                        {services.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center">
                                <SearchX className="mx-auto text-slate-300 mb-4" size={60} />
                                <h4 className="text-xl font-bold text-slate-800">No Services Available</h4>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.map((service, i) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        isFav={favorites.includes(service.id)}
                                        toggleFav={() => handleToggleFav(service.id)}
                                        index={i}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}