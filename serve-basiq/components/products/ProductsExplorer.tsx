'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { PackageOpen, Loader2 } from 'lucide-react';

// Hooks
import { useProductsExplorer } from '@/app/hook/useProductsExplorer';
import { useDebounce } from '@/app/hook/useDebounce';

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
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // Infinite Scroll Ref
    const observerTarget = useRef<HTMLDivElement>(null);

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
        search: debouncedSearchTerm,
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

    const handleToggleFav = useCallback((e: React.MouseEvent, id: string) => {
        toggleFavorite(e, id);
    }, [toggleFavorite]);

    // --- SEAMLESS INFINITE SCROLL LOGIC ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isFetching) {
                    fetchNextPage();
                }
            },
            { threshold: 0, rootMargin: '800px' }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [hasNextPage, fetchNextPage, isFetchingNextPage, isFetching]);

    // Initial Full Page Skeleton
    if (isLoading) return <ProductsSkeleton />;

    // Detect if we are actively filtering (but not just loading the next page of infinite scroll)
    const isFiltering = isFetching && !isFetchingNextPage;

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-10">
            {/* --- HEADER SECTION --- */}
            <div className="pt-4 md:pt-6 bg-slate-50">
                <div className="container mx-auto max-w-7xl px-4 mb-2">
                    {/* ✅ UPDATED CATEGORY SKELETON: Matches the boxy UI from your screenshot */}
                    {isFiltering ? (
                        <div className="flex gap-4 overflow-hidden animate-pulse mb-6 pb-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="w-[130px] md:w-[160px] h-[90px] md:h-[110px] bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm p-3">
                                    {/* Icon Placeholder */}
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                                    </div>
                                    {/* Text Placeholder */}
                                    <div className="h-2 w-3/4 bg-slate-200 rounded mb-1.5"></div>
                                    <div className="h-2 w-1/2 bg-slate-200 rounded hidden md:block"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ProductCategories categories={availableCategories} />
                    )}
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

                {/* SIDEBAR (Desktop) */}
                <aside className="hidden md:block w-[260px] shrink-0">
                    <div className="sticky top-24 h-fit">
                        <ProductFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            sortOption={sortOption} setSortOption={setSortOption}
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
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                {isFiltering ? (
                                    <Loader2 className="animate-spin text-blue-500" size={18} />
                                ) : (
                                    <FaMagnifyingGlass className="text-slate-400" size={18} />
                                )}
                            </div>
                            <input
                                type="text" placeholder="Search products..."
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-base"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500 transition-colors">
                                    <FaXmark size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC GRID / SKELETON */}
                    <div className="transition-opacity duration-300">
                        {isFiltering ? (
                            // INLINE GRID SKELETON (Shows immediately when typing or filtering)
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-[280px] w-full border border-slate-100 flex flex-col p-4 justify-end">
                                        <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-slate-300 rounded w-1/2 mb-4"></div>
                                        <div className="h-8 bg-slate-300 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : rawProducts.length === 0 ? (
                            // EMPTY STATE
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <PackageOpen className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No products found</h4>
                                <button type="button" onClick={resetFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                {/* NATIVE GRID */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {rawProducts.map((item) => (
                                        <ProductCard
                                            key={item.id}
                                            product={item}
                                            isFav={favorites.includes(item.id)}
                                            toggleFav={(e) => handleToggleFav(e!, item.id)}
                                            currentUser={currentUser}
                                        />
                                    ))}
                                </div>

                                {/* SCROLL TRIGGER / FOOTER */}
                                <div ref={observerTarget} className="w-full py-8 mt-4 flex flex-col items-center justify-center min-h-[50px]">
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                            <Loader2 className="animate-spin h-4 w-4" />
                                            <span className="text-sm font-medium">Loading more...</span>
                                        </div>
                                    ) : (
                                        <div className="h-1 w-full" />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}