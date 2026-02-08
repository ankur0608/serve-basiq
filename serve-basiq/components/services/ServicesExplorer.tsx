'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FaFire, FaArrowLeft, FaScrewdriverWrench } from 'react-icons/fa6';
import { SearchX } from 'lucide-react';
import { BiMap } from "react-icons/bi";

// Internal Components
import ServiceCard from '@/components/ui/ServiceCard';
import AppImage from '@/components/ui/AppImage';

// --- SKELETON LOADER ---
function ExplorerSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded mb-10"></div>

            <div className="mb-12">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-200 rounded-xl mb-2"></div>
                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                        </div>
                    ))}
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

    // 1️⃣ Query: Current User Profile (Includes Addresses)
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    // 2️⃣ Query: User Favorites
    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [] };
            const data = await res.json();
            setFavorites(data.services || []);
            return data;
        },
        staleTime: 0,
    });

    // 3️⃣ Query: Categories
    const { data: categories = [], isLoading: catLoading } = useQuery({
        queryKey: ['categories', 'SERVICE'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

    // 4️⃣ Query: Services & Rentals
    const { data: apiResponse, isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/services?limit=12');
            return res.json(); // Returns { services: [...], rentals: [...] }
        },
        staleTime: 1000 * 60 * 1,
    });

    // ✅ Normalizing & Combining Data
    const items = useMemo(() => {
        if (!apiResponse) return [];

        const servicesList = apiResponse.services || [];
        const rentalsList = apiResponse.rentals || [];

        const combined = [...servicesList, ...rentalsList];

        return combined.map((item: any) => {
            const isRental = !!item.rentalImg; // Distinguish rental vs service
            const type = isRental ? 'RENTAL' : 'SERVICE';

            return {
                id: item.id,
                name: item.name,
                category: item.category?.name || "General",
                subcategory: item.subcategory?.name,
                price: Number(item.price) || 0,
                priceType: item.priceType,
                rating: item.rating || 4.8,
                reviewCount: item._count?.reviews || 12,
                location: item.city || "Remote",
                image: item.serviceimg || item.rentalImg || item.mainimg || item.user?.profileImage || "",
                isVerified: item.isVerified,
                user: item.user,
                type
            } as const;
        });
    }, [apiResponse]);

    const loading = catLoading || servLoading;

    const handleToggleFav = async (id: string) => {
        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];

        setFavorites(newFavorites);

        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'SERVICE' })
            });
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
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
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Services & Rentals</h1>
                            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 pl-3 pr-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
                                <BiMap className="text-blue-600 text-lg" /> <span>Global</span>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? <ExplorerSkeleton /> : (
                    <div className="animate-in fade-in duration-500">

                        {/* Services & Rentals Section */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <FaFire className="text-orange-500 animate-pulse" /> Popular Near You
                            </h3>
                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                {items.length} Results Found
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center">
                                <SearchX className="mx-auto text-slate-300 mb-4" size={60} />
                                <h4 className="text-xl font-bold text-slate-800">No Services or Rentals Available</h4>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {items.map((item, i) => {
                                    // ✅ DYNAMIC ROUTING: Choose path based on item type
                                    const detailLink = item.type === 'RENTAL' ? `/rentals/${item.id}` : `/services/${item.id}`;

                                    return (
                                        <ServiceCard
                                            key={item.id}
                                            service={item as any} // ✅ Cast to any briefly if interfaces are drifting
                                            isFav={favorites.includes(item.id)}
                                            toggleFav={(e: React.MouseEvent) => { // ✅ Fix for Error 7006
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleToggleFav(item.id);
                                            }}
                                            index={i}
                                            currentUser={currentUser}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}