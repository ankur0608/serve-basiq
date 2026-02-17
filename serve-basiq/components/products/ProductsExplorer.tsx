'use client';

import { useState, useMemo, useCallback, forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { PackageOpen, Loader2 } from 'lucide-react';
import { VirtuosoGrid } from 'react-virtuoso';

// Hooks
import { useProductsExplorer } from '@/app/hook/useProductsExplorer';

// Components
import ProductCard from '@/components/ui/ProductCard';
import ProductCategories from '@/components/home/ProductCategories';
import ProductFiltersDesktop from './ProductFiltersDesktop';
import ProductFiltersMobile from './ProductFiltersMobile';
import { ProductsSkeleton } from './ProductsSkeleton';

export default function ProductsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // 2. Data Hook
    const {
        currentUser,
        favorites,
        toggleFavorite,
        rawProducts,
        rawCategories,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useProductsExplorer({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchTerm,
        location: selectedLocation,
        sort: sortOption
    });

    // 3. Derived Data
    const availableCategories = rawCategories || [];

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    const uniqueLocations = useMemo(() => {
        const locs = new Set(rawProducts.map(i => i.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [rawProducts]);

    const resetFilters = () => {
        setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory('');
        setSelectedLocation(''); setSortOption('');
        router.push('/products');
    };

    // Callback for memoized cards
    const handleToggleFav = useCallback((e: React.MouseEvent, id: string) => {
        toggleFavorite(e, id);
    }, [toggleFavorite]);

    if (isLoading) return <ProductsSkeleton />;

    return (
        // Changed h-screen to min-h-screen to enable page-level scrolling
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-10">
            {/* --- HEADER SECTION --- */}
            <div className="pt-4 md:pt-6 bg-slate-50">
                <div className="container mx-auto max-w-7xl px-4 mb-2">
                    <ProductCategories categories={availableCategories} />
                </div>
                <div className="container mx-auto max-w-7xl px-4">
                    <ProductFiltersMobile
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                        selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                        selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                        sortOption={sortOption} setSortOption={setSortOption}
                        availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                        uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                    />
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="container mx-auto max-w-7xl px-4 mt-2 flex gap-6 lg:gap-8">

                {/* SIDEBAR (Desktop) - Made Sticky */}
                <aside className="hidden md:block w-[260px] shrink-0">
                    <div className="sticky top-24 h-fit">
                        <ProductFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                            uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                        />
                    </div>
                </aside>

                {/* MAIN AREA */}
                <main className="relative flex-1 min-w-0">
                    {/* Desktop Search Bar */}
                    <div className="hidden md:block mb-6">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FaMagnifyingGlass size={18} />
                            </div>
                            <input
                                type="text" placeholder="Search products..."
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

                    {/* LOADING OVERLAY (Filtering State) */}
                    {isFetching && !isFetchingNextPage && rawProducts.length > 0 && (
                        <div className="fixed inset-0 bg-white/40 z-50 flex justify-center pt-40 pointer-events-none">
                            <div className="bg-white p-3 rounded-full shadow-xl border h-fit">
                                <Loader2 className="animate-spin text-slate-900 w-6 h-6" />
                            </div>
                        </div>
                    )}

                    <div>
                        {rawProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <PackageOpen className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No products found</h4>
                                <button type="button" onClick={resetFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">Clear Filters</button>
                            </div>
                        ) : (
                            <VirtuosoGrid
                                useWindowScroll
                                totalCount={rawProducts.length}
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
                                                // Responsive logic using Tailwind's breakpoints directly in style is hard,
                                                // so we set the base style and use className for overrides.
                                                gap: '1rem',
                                            }}
                                            // 2 columns by default (mobile), 2 on md, 3 on lg/desktop
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
                                    const item = rawProducts[index];
                                    return (
                                        <ProductCard
                                            key={item.id}
                                            product={item}
                                            isFav={favorites.includes(item.id)}
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