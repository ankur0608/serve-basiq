// 'use client';

// import { useState, useMemo } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
// import { KeyRound } from 'lucide-react';

// // Hooks
// import { useRentalsExplorer } from '@/app/hook/useRentalsExplorer';

// // Components
// import RentalCard from '@/components/ui/RentalCard';
// import RentalCategories from './RentalCategories';
// import RentalFiltersDesktop from './RentalFiltersDesktop';
// import RentalFiltersMobile from './RentalFiltersMobile';

// // --- SKELETON LOADER ---
// export function RentalSkeleton() {
//     return (
//         <div className="animate-pulse container mx-auto px-4 mt-8">
//              <div className="flex flex-col md:flex-row gap-6">
//                 <div className="hidden md:block w-64 h-96 bg-slate-200 rounded-xl"></div>
//                 <div className="flex-1">
//                     <div className="h-14 bg-slate-200 rounded-xl mb-6"></div>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                         {[...Array(6)].map((_, i) => (
//                              <div key={i} className="h-80 bg-slate-200 rounded-xl"></div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- MAIN COMPONENT ---
// export default function RentalsExplorer() {
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     // 1. Use Custom Hook
//     const {
//         currentUser,
//         rawRentals,
//         rawCategories,
//         isLoading
//     } = useRentalsExplorer();

//     // 2. Local State
//     const [searchTerm, setSearchTerm] = useState('');

//     // Filters State
//     const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
//     const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
//     const [selectedLocation, setSelectedLocation] = useState('');
//     const [sortOption, setSortOption] = useState('');

//     // 3. Derived Data
//     const uniqueLocations = useMemo(() => {
//         const locs = new Set(rawRentals.map(r => r.location).filter(Boolean));
//         return Array.from(locs).sort();
//     }, [rawRentals]);

//     const availableCategories = useMemo(() => {
//         if (rawCategories.length > 0) return rawCategories;
//         const uniqueCats = new Map();
//         rawRentals.forEach(item => {
//             if (item.categoryId && !uniqueCats.has(item.categoryId)) {
//                 uniqueCats.set(item.categoryId, { id: item.categoryId, name: item.categoryName, children: [] });
//             }
//         });
//         return Array.from(uniqueCats.values());
//     }, [rawCategories, rawRentals]);

//     const availableSubcategories = useMemo(() => {
//         if (!selectedCategory) return [];
//         const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
//         return cat ? cat.children : [];
//     }, [selectedCategory, availableCategories]);

//     // 4. Filtering Logic
//     const filteredAndSortedItems = useMemo(() => {
//         let result = rawRentals.filter(item => {
//             const matchesSearch = searchTerm === '' ||
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
//             const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
//             const matchesLocation = selectedLocation === '' || item.location === selectedLocation;
//             return matchesSearch && matchesCategory && matchesSubcategory && matchesLocation;
//         });

//         if (sortOption === 'price_asc') {
//             result.sort((a, b) => a.price - b.price);
//         } else if (sortOption === 'price_desc') {
//             result.sort((a, b) => b.price - a.price);
//         } else if (sortOption === 'rating') {
//             result.sort((a, b) => b.rating - a.rating);
//         } else if (sortOption === 'popular') {
//             result.sort((a, b) => b.reviewCount - a.reviewCount);
//         }
//         return result;
//     }, [rawRentals, searchTerm, selectedCategory, selectedSubcategory, selectedLocation, sortOption]);

//     const resetFilters = () => {
//         setSearchTerm('');
//         setSelectedCategory('');
//         setSelectedSubcategory('');
//         setSelectedLocation('');
//         setSortOption('');
//         router.push('/rentals');
//     };

//     return (
//         <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

//             {/* --- 1. POPULAR CATEGORIES --- */}
//             <div className="container mx-auto max-w-7xl px-4 mb-6">
//                 <RentalCategories categories={availableCategories} />
//             </div>

//             {/* --- 2. MAIN LAYOUT --- */}
//             <div className="container mx-auto max-w-7xl px-4 relative z-10">

//                 {/* Mobile Filters (Hidden on Desktop) */}
//                 <RentalFiltersMobile 
//                     searchTerm={searchTerm} setSearchTerm={setSearchTerm}
//                     selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
//                     selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
//                     selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
//                     sortOption={sortOption} setSortOption={setSortOption}
//                     availableCategories={availableCategories} availableSubcategories={availableSubcategories}
//                     uniqueLocations={uniqueLocations} resetFilters={resetFilters}
//                 />

//                 {/* Desktop Grid Layout */}
//                 <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2">

//                     {/* Left Sidebar (Desktop Only) */}
//                     <aside className="hidden md:block w-[260px] shrink-0">
//                         <RentalFiltersDesktop 
//                             selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
//                             selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
//                             selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
//                             availableCategories={availableCategories} availableSubcategories={availableSubcategories}
//                             uniqueLocations={uniqueLocations} resetFilters={resetFilters}
//                         />
//                     </aside>

//                     {/* Right Content Area */}
//                     <main className="flex-1 min-w-0">

//                          {/* Desktop Search Bar */}
//                          <div className="hidden md:block mb-6">
//                             <div className="relative w-full">
//                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
//                                     <FaMagnifyingGlass size={18} />
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="Search rentals, equipment, or vehicles..."
//                                     className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900 text-base"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                                 {searchTerm && (
//                                     <button 
//                                         onClick={() => setSearchTerm('')} 
//                                         className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500"
//                                     >
//                                         <FaXmark size={18} />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Results Grid */}
//                         {isLoading ? <div className="h-64 flex items-center justify-center">Loading...</div> : (
//                             <div className="animate-in fade-in duration-500">
//                                 {filteredAndSortedItems.length === 0 ? (
//                                     <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
//                                         <div className="p-4 bg-slate-50 rounded-full mb-4">
//                                             <KeyRound className="text-slate-400" size={40} />
//                                         </div>
//                                         <h4 className="text-xl font-bold text-slate-800">No rentals found</h4>
//                                         <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">
//                                             Try adjusting your filters or search for something else.
//                                         </p>
//                                         <button onClick={resetFilters} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
//                                             Clear Filters
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//                                         {filteredAndSortedItems.map((item) => (
//                                             <RentalCard key={item.id} rental={item} />
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </main>
//                 </div>
//             </div>
//         </section>
//     );
// }








'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { KeyRound, Loader2 } from 'lucide-react';

// Hooks
import { useRentalsExplorer } from '@/app/hook/useRentalsExplorer';

// Components
import RentalCard from '@/components/ui/RentalCard';
import RentalCategories from './RentalCategories';
import RentalFiltersDesktop from './RentalFiltersDesktop';
import RentalFiltersMobile from './RentalFiltersMobile';

// --- SKELETON LOADER ---
export function RentalSkeleton() {
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
export default function RentalsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // Use Custom Hook (Passing filters to API)
    const {
        currentUser,
        rawRentals,
        rawCategories,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useRentalsExplorer({
        category: selectedCategory,
        search: searchTerm // Note: In production, wrap this in useDebounce
    });

    // --- INFINITE SCROLL OBSERVER ---
    const observerTarget = useRef(null);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries;
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const element = observerTarget.current;
        const option = { threshold: 0.1 };

        const observer = new IntersectionObserver(handleObserver, option);
        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [handleObserver]);

    // Client-side Sorting & Sub-filtering
    const uniqueLocations = useMemo(() => {
        const locs = new Set(rawRentals.map(r => r.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [rawRentals]);

    const availableCategories = useMemo(() => {
        if (rawCategories.length > 0) return rawCategories;
        return [];
    }, [rawCategories]);

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    const filteredAndSortedItems = useMemo(() => {
        let result = [...rawRentals];

        // Filter: Subcategory & Location (Client side for now, can move to API if needed)
        if (selectedSubcategory) {
            result = result.filter(item => String(item.subcategoryId) === String(selectedSubcategory));
        }
        if (selectedLocation) {
            result = result.filter(item => item.location === selectedLocation);
        }

        // Sort
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
    }, [rawRentals, selectedSubcategory, selectedLocation, sortOption]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedLocation('');
        setSortOption('');
        router.push('/rentals');
    };

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

            {/* --- 1. POPULAR CATEGORIES --- */}
            <div className="container mx-auto max-w-7xl px-4 mb-6">
                <RentalCategories categories={availableCategories} />
            </div>

            {/* --- 2. MAIN LAYOUT --- */}
            <div className="container mx-auto max-w-7xl px-4 relative z-10">

                {/* Mobile Filters */}
                <RentalFiltersMobile
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

                    {/* Left Sidebar */}
                    <aside className="hidden md:block w-[260px] shrink-0">
                        <RentalFiltersDesktop
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
                                    placeholder="Search rentals, equipment, or vehicles..."
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
                        {isLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : (
                            <div className="animate-in fade-in duration-500">
                                {filteredAndSortedItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <KeyRound className="text-slate-400" size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">No rentals found</h4>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">
                                            Try adjusting your filters or search for something else.
                                        </p>
                                        <button onClick={resetFilters} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {filteredAndSortedItems.map((item) => (
                                                <RentalCard key={item.id} rental={item} />
                                            ))}
                                        </div>

                                        {/* --- INFINITE SCROLL LOADER --- */}
                                        <div ref={observerTarget} className="flex justify-center py-8 min-h-[50px]">
                                            {isFetchingNextPage && (
                                                <Loader2 className="animate-spin text-slate-400" size={32} />
                                            )}
                                            {!hasNextPage && filteredAndSortedItems.length > 0 && (
                                                <p className="text-slate-400 text-sm font-medium">No more rentals to show</p>
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