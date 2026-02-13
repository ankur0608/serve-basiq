'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// Icons
import { SearchX } from 'lucide-react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'; // Import needed for desktop search bar

// Components
import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard';
import ServiceCategories from '../home/ServiceCategories';
import ServiceFiltersDesktop from './ServiceFiltersDesktop';
import ServiceFiltersMobile from './ServiceFiltersMobile';

// --- TYPES ---
export interface CategoryData {
    id: string;
    name: string;
    children: { id: string; name: string }[];
    image?: string;
}

interface ExplorerItem extends ServiceProps {
    categoryId?: string | number;
    categoryName: string;
    subcategoryId?: string | number;
    subcategoryName?: string;
    reviewCount?: number;
    type: 'Service' | 'Rental';
}

// --- SKELETON LOADER ---
export function ExplorerSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-4">
            {/* Simple Skeleton for the new layout */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="hidden md:block w-64 h-96 bg-slate-200 rounded-xl"></div>
                <div className="flex-1">
                    <div className="h-14 bg-slate-200 rounded-xl mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 bg-slate-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function ServicesExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- 1. State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    // Filters State
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [sortOption, setSortOption] = useState('');

    // --- 2. Data Fetching ---
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            const data = await res.json();
            setFavorites(data.services || []);
            return data;
        },
        staleTime: 0,
    });

    const { data: apiResponse, isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/provider/services?limit=100');
            return res.json();
        },
        staleTime: 1000 * 60 * 1,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    // --- 3. Data Normalization ---
    const rawItems: ExplorerItem[] = useMemo(() => {
        if (!apiResponse) return [];
        const services = apiResponse.services || [];

        const mapItem = (item: any, type: 'Service' | 'Rental') => ({
            id: item.id,
            name: item.name,
            categoryId: item.category?.id,
            categoryName: item.category?.name || "General",
            subcategoryId: item.subcategory?.id,
            subcategoryName: item.subcategory?.name,
            price: Number(item.price) || 0,
            priceType: item.priceType || 'FIXED',
            rating: Number(item.rating) || 0,
            reviewCount: item._count?.reviews || 0,
            location: item.city || "Remote",
            image: type === 'Service'
                ? (item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80")
                : (item.rentalImg || item.coverImg || "https://images.unsplash.com/photo-1503951458645-643d53633299?auto=format&fit=crop&q=80"),
            type: type as 'Service' | 'Rental'
        });

        return [...services.map((s: any) => mapItem(s, 'Service'))];
    }, [apiResponse]);

    // --- 4. Dynamic Filter Options ---
    const uniqueLocations = useMemo(() =>
        [...new Set(rawItems.map(i => i.location).filter(Boolean))].sort(),
        [rawItems]);

    const availableCategories: CategoryData[] = useMemo(() => {
        if (categoriesData && categoriesData.length > 0) return categoriesData;
        return [];
    }, [categoriesData]);

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    // --- 5. Filtering & Sorting Logic ---
    const filteredAndSortedItems = useMemo(() => {
        let result = rawItems.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = selectedLocation === '' || item.location === selectedLocation;
            const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
            const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
            return matchesSearch && matchesLocation && matchesCategory && matchesSubcategory;
        });

        if (sortOption === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'popular') {
            result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        }
        return result;
    }, [rawItems, searchTerm, selectedLocation, selectedCategory, selectedSubcategory, sortOption]);

    // --- Handlers ---
    const handleToggleFav = async (e: React.MouseEvent, id: string, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
        setFavorites(newFavorites);
        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: type.toUpperCase() })
            });
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSortOption('');
        router.push('/services');
    };

    const resultCount = filteredAndSortedItems.length;

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

            {/* --- POPULAR CATEGORIES (Kept at top) --- */}
            <div className="container mx-auto max-w-7xl px-4 mb-6">
                <ServiceCategories categories={availableCategories} />
            </div>

            {/* --- MAIN LAYOUT --- */}
            <div className="container mx-auto max-w-7xl px-4 relative z-10">

                {/* Mobile Filters (Hidden on Desktop) */}
                <ServiceFiltersMobile
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                    selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                    sortOption={sortOption} setSortOption={setSortOption}
                    availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                    uniqueLocations={uniqueLocations} resetFilters={resetFilters} resultCount={resultCount}
                />

                {/* Desktop Grid Layout */}
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2">

                    {/* Left Sidebar (Desktop Only) */}
                    <aside className="hidden md:block w-[260px] shrink-0">
                        <ServiceFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                            uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                        />
                    </aside>

                    {/* Right Content Area */}
                    <main className="flex-1 min-w-0">

                        {/* Desktop Search Bar (Hidden on Mobile) */}
                        <div className="hidden md:block mb-6">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FaMagnifyingGlass size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500"
                                    >
                                        <FaXmark size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Grid */}
                        {servLoading ? <div className="h-64 flex items-center justify-center">Loading...</div> : (
                            <div className="animate-in fade-in duration-500">
                                {filteredAndSortedItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <SearchX className="text-slate-400" size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">No results found</h4>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">
                                            We couldn't find any services matching your filters.
                                        </p>
                                        <button onClick={resetFilters} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        {filteredAndSortedItems.map((item) => (
                                            <ServiceCard
                                                key={item.id}
                                                service={item}
                                                isFav={favorites.includes(item.id)}
                                                toggleFav={(e) => handleToggleFav(e!, item.id, item.type)}
                                                currentUser={currentUser}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
}