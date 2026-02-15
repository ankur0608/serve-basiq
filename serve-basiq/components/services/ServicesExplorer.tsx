'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { SearchX, Loader2 } from 'lucide-react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

// Hooks
import { useServicesExplorer } from '@/app/hook/useServicesExplorer';

// Components
import ServiceCard from '@/components/ui/ServiceCard';
import ServiceCategories from '../home/ServiceCategories';
import ServiceFiltersDesktop from './ServiceFiltersDesktop';
import ServiceFiltersMobile from './ServiceFiltersMobile';
import { ProductsSkeleton } from '../products/ProductsSkeleton';


export default function ServicesExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ref, inView } = useInView();

    // --- UI State (Filters) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [sortOption, setSortOption] = useState('');

    // --- Custom Hook (Handles all API Logic) ---
    const {
        services,
        categories,
        currentUser,
        favoriteIds,
        toggleFavorite,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useServicesExplorer({
        search: searchTerm,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        location: selectedLocation,
        sort: sortOption
    });

    // --- Scroll Detection ---
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // --- Client-side Helpers (Subcategories & Locations) ---
    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = categories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, categories]);

    const uniqueLocations = useMemo(() =>
        [...new Set(services.map(i => i.location).filter(Boolean))].sort(),
        [services]);

    const resetFilters = () => {
        setSearchTerm(''); setSelectedLocation(''); setSelectedCategory('');
        setSelectedSubcategory(''); setSortOption('');
        router.push('/services');
    };

    const handleToggleFav = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        toggleFavorite({ id, type: 'SERVICE' });
    };
    if (isLoading) {
        return <ProductsSkeleton />;
    }
    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">
            <div className="container mx-auto max-w-7xl px-4 mb-6">
                <ServiceCategories categories={categories} />
            </div>

            <div className="container mx-auto max-w-7xl px-4 relative z-10">
                <ServiceFiltersMobile
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                    selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                    sortOption={sortOption} setSortOption={setSortOption}
                    availableCategories={categories} availableSubcategories={availableSubcategories}
                    uniqueLocations={uniqueLocations} resetFilters={resetFilters} resultCount={services.length}
                />

                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2">
                    <aside className="hidden md:block w-[260px] shrink-0">
                        <ServiceFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={categories} availableSubcategories={availableSubcategories}
                            uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                        />
                    </aside>

                    <main className="flex-1 min-w-0">
                        <div className="hidden md:block mb-6">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FaMagnifyingGlass size={18} />
                                </div>
                                <input
                                    type="text" placeholder="Search..."
                                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-base"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500">
                                        <FaXmark size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center text-slate-400">
                                <Loader2 className="animate-spin mr-2" /> Loading services...
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                {services.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <SearchX className="text-slate-400" size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">No results found</h4>
                                        <button onClick={resetFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {services.map((item) => (
                                                <ServiceCard
                                                    key={item.id}
                                                    service={item}
                                                    isFav={favoriteIds.includes(item.id)}
                                                    toggleFav={(e) => handleToggleFav(e!, item.id)}
                                                    currentUser={currentUser}
                                                />
                                            ))}
                                        </div>
                                        <div ref={ref} className="flex justify-center items-center py-8 mt-4">
                                            {isFetchingNextPage && (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Loader2 className="animate-spin h-5 w-5" />
                                                    <span className="text-sm font-medium">Loading more...</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
}