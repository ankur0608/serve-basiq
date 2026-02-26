'use client';

import { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Filter, X, MapPin } from 'lucide-react';

export interface CategoryData {
    id: string;
    name: string;
    children: { id: string; name: string }[];
    image?: string;
}

interface MobileFiltersProps {
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
    availableCategories: CategoryData[];
    availableSubcategories: { id: string; name: string }[];
    uniqueLocations: string[];
    resetFilters: () => void;
    resultCount: number;
}

export default function ServiceFiltersMobile({
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedSubcategory, setSelectedSubcategory,
    selectedLocation, setSelectedLocation,
    sortOption, setSortOption,
    availableCategories, availableSubcategories, uniqueLocations,
    resetFilters
}: MobileFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => setIsOpen(false);

    // 👇 Updated: Now it only resets filters and leaves the modal open
    const handleReset = () => {
        resetFilters();
    };

    return (
        <div className="md:hidden">
            {/* Search Bar & Button */}
            <div className="flex gap-2 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FaMagnifyingGlass size={14} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full pl-9 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="bg-slate-900 text-white w-12 rounded-lg flex items-center justify-center active:scale-95 transition shadow-md"
                >
                    <Filter size={18} />
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-slate-900"
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

                            {/* Subcategory */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subcategory</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50"
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

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-slate-900"
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
                            </div>

                            {/* Sort */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-slate-900"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <option value="">Default</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                    <Filter className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm">
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg text-sm">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}