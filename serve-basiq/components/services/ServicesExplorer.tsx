'use client';

import { useState, useMemo, useCallback, forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchX, Loader2 } from 'lucide-react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { VirtuosoGrid } from 'react-virtuoso';

import { useServicesExplorer } from '@/app/hook/useServicesExplorer';
import ServiceCard from '@/components/ui/ServiceCard';
import ServiceCategories from '../home/ServiceCategories';
import ServiceFiltersDesktop from './ServiceFiltersDesktop';
import ServiceFiltersMobile from './ServiceFiltersMobile';
import { ProductsSkeleton } from '../products/ProductsSkeleton';

export default function ServicesExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [sortOption, setSortOption] = useState('');

    const {
        services,
        categories,
        currentUser,
        favoriteIds,
        toggleFavorite,
        isLoading,
        isFetching,
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

    const handleToggleFav = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        toggleFavorite({ id, type: 'SERVICE' });
    }, [toggleFavorite]);

    if (isLoading) return <ProductsSkeleton />;

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-10">
            {/* --- HEADER SECTION --- */}
            <div className="pt-4 md:pt-6 bg-slate-50">
                <div className="container mx-auto max-w-7xl px-4 mb-2">
                    <ServiceCategories categories={categories} />
                </div>
                <div className="container mx-auto max-w-7xl px-4">
                    <ServiceFiltersMobile
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                        selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                        selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                        sortOption={sortOption} setSortOption={setSortOption}
                        availableCategories={categories} availableSubcategories={availableSubcategories}
                        uniqueLocations={uniqueLocations} resetFilters={resetFilters} resultCount={services.length}
                    />
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 mt-2 flex gap-6 lg:gap-8">
                {/* SIDEBAR (Desktop) */}
                <aside className="hidden md:block w-[260px] shrink-0">
                    <div className="sticky top-24 h-fit">
                        <ServiceFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={categories} availableSubcategories={availableSubcategories}
                            uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                        />
                    </div>
                </aside>

                {/* GRID AREA */}
                <main className="relative flex-1 min-w-0">
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

                    {/* LOADING OVERLAY */}
                    {isFetching && !isFetchingNextPage && services.length > 0 && (
                        <div className="fixed inset-0 bg-white/40 z-50 flex justify-center pt-40 pointer-events-none">
                            <div className="bg-white p-3 rounded-full shadow-xl border h-fit">
                                <Loader2 className="animate-spin text-slate-900 w-6 h-6" />
                            </div>
                        </div>
                    )}

                    <div>
                        {services.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <SearchX className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No results found</h4>
                                <button type="button" onClick={resetFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">Clear Filters</button>
                            </div>
                        ) : (
                            <VirtuosoGrid
                                useWindowScroll
                                totalCount={services.length}
                                endReached={() => hasNextPage && fetchNextPage()}
                                overscan={1000}
                                components={{
                                    List: forwardRef<HTMLDivElement, ComponentPropsWithRef<'div'>>(({ style, children, ...props }, ref) => (
                                        <div
                                            ref={ref}
                                            {...props}
                                            style={{
                                                ...style,
                                                display: 'grid',
                                                // We remove the hardcoded column count from style so className handles it
                                                gap: '1rem',
                                            }}
                                            // 2 columns mobile, 3 columns desktop (lg breakpoint)
                                            className="grid grid-cols-2 lg:grid-cols-3 md:gap-6 pb-20"
                                        >
                                            {children}
                                        </div>
                                    )),
                                    Footer: () => isFetchingNextPage ? (
                                        <div className="py-10 flex justify-center w-full">
                                            <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
                                        </div>
                                    ) : null
                                }}
                                itemContent={(index) => {
                                    const item = services[index];
                                    return (
                                        <ServiceCard
                                            key={item.id}
                                            service={item}
                                            isFav={favoriteIds.includes(item.id)}
                                            toggleFav={(e) => handleToggleFav(e!, item.id)}
                                            currentUser={currentUser}
                                        />
                                    );
                                }}
                            />
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}