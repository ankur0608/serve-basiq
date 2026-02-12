'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { Filter, MapPin, KeyRound, X, SlidersHorizontal } from 'lucide-react';

// Hooks
import { useRentalsExplorer, CategoryData } from '@/app/hook/useRentalsExplorer';

// Components
import RentalCard from '@/components/ui/RentalCard';
// Make sure this path matches where you saved the RentalCategories component from the previous step
import RentalCategories from './RentalCategories';

// --- SKELETON LOADER ---
export function RentalSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border h-72 flex flex-col overflow-hidden">
                        <div className="h-36 bg-slate-200"></div>
                        <div className="p-3 gap-2 flex flex-col flex-1">
                            <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                            <div className="mt-auto h-8 bg-slate-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function RentalsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Use Custom Hook
    const {
        currentUser,
        rawRentals,
        rawCategories,
        isLoading
    } = useRentalsExplorer();

    // 2. Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters State
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // 3. Derived Data
    const uniqueLocations = useMemo(() => {
        const locs = new Set(rawRentals.map(r => r.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [rawRentals]);

    const availableCategories = useMemo(() => {
        if (rawCategories.length > 0) return rawCategories;
        // Fallback: Extract from rentals if API empty
        const uniqueCats = new Map();
        rawRentals.forEach(item => {
            if (item.categoryId && !uniqueCats.has(item.categoryId)) {
                uniqueCats.set(item.categoryId, { id: item.categoryId, name: item.categoryName, children: [] });
            }
        });
        return Array.from(uniqueCats.values());
    }, [rawCategories, rawRentals]);

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    // 4. Filtering Logic
    const filteredAndSortedItems = useMemo(() => {
        let result = rawRentals.filter(item => {
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
            result.sort((a, b) => b.reviewCount - a.reviewCount);
        }
        return result;
    }, [rawRentals, searchTerm, selectedCategory, selectedSubcategory, selectedLocation, sortOption]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedLocation('');
        setSortOption('');
        setShowMobileFilters(false);
        router.push('/rentals');
    };

    // --- RENDER HELPERS ---
    const CategorySelect = () => (
        <div className="relative">
            <select
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                }}
            >
                <option value="">All Categories</option>
                {availableCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <Filter className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
    );

    const SubcategorySelect = () => (
        <div className="relative">
            <select
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory || availableSubcategories.length === 0}
            >
                <option value="">All Subcategories</option>
                {availableSubcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
            </select>
            <Filter className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
    );

    const LocationSelect = () => (
        <div className="relative">
            <select
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
            >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc: string) => (
                    <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>
            <MapPin className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
    );

    const SortSelect = () => (
        <div className="relative">
            <select
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="">Sort By: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
            </select>
            <Filter className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
    );

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

            {/* --- 1. POPULAR CATEGORIES (Added Here) --- */}
            <div className="container mx-auto max-w-6xl px-4">
                <RentalCategories categories={availableCategories} />
            </div>

            {/* --- 2. SEARCH & FILTERS CONTAINER --- */}
            <div className="container mx-auto max-w-6xl px-4 mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">

                    {/* --- MOBILE VIEW --- */}
                    <div className="md:hidden flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaMagnifyingGlass />
                            </div>
                            <input
                                type="text"
                                placeholder="Search rentals..."
                                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center min-w-[50px] active:scale-95 transition"
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>

                    {/* --- DESKTOP VIEW --- */}
                    <div className="hidden md:block">
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FaMagnifyingGlass />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for tools, equipment, or vehicles..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500">
                                        <FaXmark />
                                    </button>
                                )}
                            </div>
                            <button className="bg-slate-900 text-white px-6 md:px-8 rounded-xl font-bold hover:bg-slate-800 transition">
                                Search
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <CategorySelect />
                            <SubcategorySelect />
                            <LocationSelect />
                            <SortSelect />
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(selectedCategory || selectedSubcategory || selectedLocation || sortOption) && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500">
                                {filteredAndSortedItems.length} results found
                            </p>
                            <button onClick={resetFilters} className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline">
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 3. RESULTS GRID --- */}
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {isLoading ? <RentalSkeleton /> : (
                    <div className="animate-in fade-in duration-500">
                        {filteredAndSortedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <KeyRound className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No rentals found</h4>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    Try adjusting your filters or search for something else.
                                </p>
                                <button onClick={resetFilters} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                    View All Rentals
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedItems.map((item) => (
                                    <RentalCard key={item.id} rental={item} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- MOBILE FILTER MODAL --- */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                <CategorySelect />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Subcategory</label>
                                <SubcategorySelect />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                <LocationSelect />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Sort By</label>
                                <SortSelect />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}