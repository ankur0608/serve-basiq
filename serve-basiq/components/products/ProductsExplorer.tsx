'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { PackageOpen } from 'lucide-react';

// Hooks
import { useProductsExplorer } from '@/app/hook/useProductsExplorer';

// Components
import ProductCard from '@/components/ui/ProductCard';
import ProductCategories from '@/components/home/ProductCategories';
import ProductFiltersDesktop from './ProductFiltersDesktop';
import ProductFiltersMobile from './ProductFiltersMobile';

// --- SKELETON LOADER ---
export function ProductsSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-8">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="hidden md:block w-64 h-96 bg-slate-200 rounded-xl"></div>
                <div className="flex-1">
                    <div className="h-14 bg-slate-200 rounded-xl mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-slate-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function ProductsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Use Custom Hook for Data & API logic
    const {
        currentUser,
        favorites,
        toggleFavorite,
        rawProducts,
        rawCategories,
        isLoading
    } = useProductsExplorer();

    // 2. Local View State (UI Controls)
    const [searchTerm, setSearchTerm] = useState('');

    // Filters State
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // 3. Derived Data (Dropdown Options)
    const uniqueLocations = useMemo(() => {
        const locs = new Set(rawProducts.map(i => i.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [rawProducts]);

    const availableCategories = useMemo(() => {
        if (rawCategories.length > 0) return rawCategories;
        const uniqueCats = new Map();
        rawProducts.forEach(item => {
            if (item.categoryId && !uniqueCats.has(item.categoryId)) {
                uniqueCats.set(item.categoryId, { id: item.categoryId, name: item.categoryName, children: [] });
            }
        });
        return Array.from(uniqueCats.values());
    }, [rawCategories, rawProducts]);

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    // 4. Filtering & Sorting Logic
    const filteredAndSortedItems = useMemo(() => {
        let result = rawProducts.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
            const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
            const matchesLocation = selectedLocation === '' || item.location === selectedLocation;
            return matchesSearch && matchesCategory && matchesSubcategory && matchesLocation;
        });

        if (sortOption === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'popular') {
            result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        }
        return result;
    }, [rawProducts, searchTerm, selectedCategory, selectedSubcategory, selectedLocation, sortOption]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedLocation('');
        setSortOption('');
        router.push('/products');
    };

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

            {/* --- 1. POPULAR CATEGORIES --- */}
            <div className="container mx-auto max-w-7xl px-4 mb-6">
                <ProductCategories categories={availableCategories} />
            </div>

            {/* --- 2. MAIN LAYOUT --- */}
            <div className="container mx-auto max-w-7xl px-4 relative z-10">

                {/* Mobile Filters (Hidden on Desktop) */}
                <ProductFiltersMobile
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                    selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                    sortOption={sortOption} setSortOption={setSortOption}
                    availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                    uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                />

                {/* Desktop Grid Layout */}
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2">

                    {/* Left Sidebar (Desktop Only) */}
                    <aside className="hidden md:block w-[260px] shrink-0">
                        <ProductFiltersDesktop
                            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                            selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                            availableCategories={availableCategories} availableSubcategories={availableSubcategories}
                            uniqueLocations={uniqueLocations} resetFilters={resetFilters}
                        />
                    </aside>

                    {/* Right Content Area */}
                    <main className="flex-1 min-w-0">

                        {/* Desktop Search Bar */}
                        <div className="hidden md:block mb-6">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FaMagnifyingGlass size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products, suppliers, or categories..."
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
                        {isLoading ? <div className="h-64 flex items-center justify-center">Loading...</div> : (
                            <div className="animate-in fade-in duration-500">
                                {filteredAndSortedItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <PackageOpen className="text-slate-400" size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">No products found</h4>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">
                                            Try adjusting your filters or search for something else.
                                        </p>
                                        <button onClick={resetFilters} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        {filteredAndSortedItems.map((item) => (
                                            <ProductCard
                                                key={item.id}
                                                product={item}
                                                isFav={favorites.includes(item.id)}
                                                toggleFav={(e) => toggleFavorite(e!, item.id)}
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