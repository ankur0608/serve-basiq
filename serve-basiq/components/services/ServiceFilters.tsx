'use client';

import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { Filter, MapPin, X } from 'lucide-react';

// --- TYPES FOR PROPS ---
export interface CategoryData {
    id: string;
    name: string;
    children: { id: string; name: string }[];
}

interface ServiceFiltersProps {
    // State
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedCategory: string;
    setSelectedCategory: (val: string) => void;
    selectedSubcategory: string;
    setSelectedSubcategory: (val: string) => void;
    selectedLocation: string;
    setSelectedLocation: (val: string) => void;
    sortOption: string;
    setSortOption: (val: string) => void;
    showMobileFilters: boolean;
    setShowMobileFilters: (val: boolean) => void;

    // Data
    availableCategories: CategoryData[];
    availableSubcategories: { id: string; name: string }[];
    uniqueLocations: string[];

    // Actions
    resetFilters: () => void;
    resultCount: number;
}

export default function ServiceFilters({
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedSubcategory, setSelectedSubcategory,
    selectedLocation, setSelectedLocation,
    sortOption, setSortOption,
    showMobileFilters, setShowMobileFilters,
    availableCategories, availableSubcategories, uniqueLocations,
    resetFilters, resultCount
}: ServiceFiltersProps) {

    // --- REUSABLE DROPDOWNS ---
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
                {availableCategories.map((cat) => (
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
                {availableSubcategories.map((sub) => (
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
                {uniqueLocations.map(loc => (
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
        <>
            {/* --- CONTAINER --- */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">

                {/* --- MOBILE VIEW --- */}
                <div className="md:hidden flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FaMagnifyingGlass />
                        </div>
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center min-w-[50px] active:scale-95 transition"
                    >
                        <Filter size={20} />
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
                                placeholder="Search for services, repairs, or experts..."
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

                {/* --- ACTIVE FILTER SUMMARY --- */}
                {(selectedCategory || selectedLocation || selectedSubcategory || sortOption) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500">
                            {resultCount} results found
                        </p>
                        <button onClick={resetFilters} className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline">
                            Clear All Filters
                        </button>
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
        </>
    );
}