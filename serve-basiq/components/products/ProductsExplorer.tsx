'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { PackageOpen, Loader2 } from 'lucide-react';

// Hooks
import { useProductsExplorer } from '@/app/hook/useProductsExplorer';

// Components
import ProductCard from '@/components/ui/ProductCard';
import ProductCategories from '@/components/home/ProductCategories';
import ProductFiltersDesktop from './ProductFiltersDesktop';
import ProductFiltersMobile from './ProductFiltersMobile';
import { ProductsSkeleton } from './ProductsSkeleton';

// --- IMPROVED SKELETON LOADER ---

// --- MAIN COMPONENT ---
export default function ProductsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ref, inView } = useInView();

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

    // 3. Infinite Scroll Trigger
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 4. Derived Data
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
    if (isLoading) {
        return <ProductsSkeleton />;
    }
    const resetFilters = () => {
        setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory('');
        setSelectedLocation(''); setSortOption('');
        router.push('/products');
    };

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">
            <div className="container mx-auto max-w-7xl px-4 mb-6">
                <ProductCategories categories={availableCategories} />
            </div>

            <div className="container mx-auto max-w-7xl px-4 relative z-10">
                <ProductFiltersMobile
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                    selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                    sortOption={sortOption} setSortOption={setSortOption}
                    availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                    uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                />

                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2">
                    <aside className="hidden md:block w-[260px] shrink-0">
                        <ProductFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={availableCategories} availableSubcategories={availableSubcategories}
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
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500">
                                        <FaXmark size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                {rawProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <PackageOpen className="text-slate-400" size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">No products found</h4>
                                        <button onClick={resetFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {rawProducts.map((item) => (
                                                <ProductCard
                                                    key={item.id}
                                                    product={item}
                                                    isFav={favorites.includes(item.id)}
                                                    toggleFav={(e) => toggleFavorite(e!, item.id)}
                                                    currentUser={currentUser}
                                                />
                                            ))}
                                        </div>

                                        <div ref={ref} className="flex justify-center py-8 min-h-[50px]">
                                            {isFetchingNextPage && (
                                                <Loader2 className="animate-spin text-slate-400" size={32} />
                                            )}
                                            {!hasNextPage && rawProducts.length > 0 && (
                                                <p className="text-slate-400 text-sm font-medium">No more products</p>
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