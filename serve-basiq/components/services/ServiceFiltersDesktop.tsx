'use client';

import { Filter, MapPin, ArrowDownAZ } from 'lucide-react';
import type { CategoryData } from './ServiceFiltersMobile'; 

interface DesktopFiltersProps {
    selectedCategory: string;
    setSelectedCategory: (val: string) => void;
    selectedSubcategory: string;
    setSelectedSubcategory: (val: string) => void;
    selectedLocation: string;
    setSelectedLocation: (val: string) => void;
    sortOption: string;
    setSortOption: (val: string) => void;
    availableCategories: CategoryData[];
    availableSubcategories: { id: string; name: string }[];
    uniqueLocations: string[];
    resetFilters: () => void;
}

export default function ServiceFiltersDesktop({
    selectedCategory, setSelectedCategory,
    selectedSubcategory, setSelectedSubcategory,
    selectedLocation, setSelectedLocation,
    sortOption, setSortOption,
    availableCategories, availableSubcategories, uniqueLocations,
    resetFilters
}: DesktopFiltersProps) {

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900">Filters</h3>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-bold text-red-500 hover:text-red-600 hover:underline transition"
                >
                    Reset
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition"
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
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subcategory</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
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
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="">Any Location</option>
                            {uniqueLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <MapPin className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sort By</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="">Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="popular">Most Popular</option>
                        </select>
                        <ArrowDownAZ className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}