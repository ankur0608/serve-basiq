// 'use client';

// import { useState, useMemo } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import Image from 'next/image';

// // Icons
// import { FaArrowLeft, FaScrewdriverWrench } from 'react-icons/fa6';
// import { SearchX } from 'lucide-react';

// // Components
// import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard';
// import ServiceFilters, { CategoryData } from './ServiceFilters';

// // --- TYPES ---
// interface ExplorerItem extends ServiceProps {
//     categoryId?: string | number;
//     categoryName: string;
//     subcategoryId?: string | number;
//     subcategoryName?: string;
//     reviewCount?: number;
// }

// // --- SKELETON LOADER ---
// export function ExplorerSkeleton() {
//     return (
//         <div className="animate-pulse container mx-auto px-4 mt-8">
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {[...Array(8)].map((_, i) => (
//                     <div key={i} className="bg-white rounded-xl border h-72 flex flex-col overflow-hidden">
//                         <div className="h-36 bg-slate-200"></div>
//                         <div className="p-3 gap-2 flex flex-col flex-1">
//                             <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
//                             <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
//                             <div className="mt-auto h-8 bg-slate-200 rounded-lg"></div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// // --- MAIN COMPONENT ---
// export default function ServicesExplorer() {
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     // --- 1. State Management ---
//     const [searchTerm, setSearchTerm] = useState('');
//     const [favorites, setFavorites] = useState<string[]>([]);
//     const [showMobileFilters, setShowMobileFilters] = useState(false);

//     // Filters State
//     const [selectedLocation, setSelectedLocation] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
//     const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
//     const [sortOption, setSortOption] = useState('');

//     // --- 2. Data Fetching ---
//     const { data: currentUser } = useQuery({
//         queryKey: ['user', 'profile'],
//         queryFn: async () => {
//             const res = await fetch('/api/user/profile');
//             if (!res.ok) return null;
//             return res.json();
//         },
//         staleTime: 1000 * 60 * 5,
//     });

//     useQuery({
//         queryKey: ['favorites', 'user'],
//         queryFn: async () => {
//             const res = await fetch('/api/user/favorites');
//             if (!res.ok) return { services: [], products: [] };
//             const data = await res.json();
//             setFavorites(data.services || []);
//             return data;
//         },
//         staleTime: 0,
//     });

//     const { data: apiResponse, isLoading: servLoading } = useQuery({
//         queryKey: ['services', 'explorer'],
//         queryFn: async () => {
//             const res = await fetch('/api/provider/services?limit=100');
//             return res.json();
//         },
//         staleTime: 1000 * 60 * 1,
//     });

//     const { data: categoriesData } = useQuery({
//         queryKey: ['categories', 'service'],
//         queryFn: async () => {
//             const res = await fetch('/api/categories?type=SERVICE');
//             const data = await res.json();
//             return Array.isArray(data) ? data : [];
//         },
//         staleTime: 1000 * 60 * 60,
//     });

//     // --- 3. Data Normalization ---
//     const rawItems: ExplorerItem[] = useMemo(() => {
//         if (!apiResponse) return [];
//         const services = apiResponse.services || [];

//         const mapItem = (item: any, type: 'Service' | 'Rental') => ({
//             id: item.id,
//             name: item.name,
//             categoryId: item.category?.id,
//             categoryName: item.category?.name || "General",
//             subcategoryId: item.subcategory?.id,
//             subcategoryName: item.subcategory?.name,
//             price: Number(item.price) || 0,
//             priceType: item.priceType || 'FIXED',
//             rating: Number(item.rating) || 0,
//             reviewCount: item._count?.reviews || 0,
//             location: item.city || "Remote",
//             image: type === 'Service'
//                 ? (item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80")
//                 : (item.rentalImg || item.coverImg || "https://images.unsplash.com/photo-1503951458645-643d53633299?auto=format&fit=crop&q=80"),
//             type: type
//         });

//         return [...services.map((s: any) => mapItem(s, 'Service'))];
//     }, [apiResponse]);

//     // --- 4. Dynamic Filter Options ---
//     const uniqueLocations = useMemo(() =>
//         [...new Set(rawItems.map(i => i.location).filter(Boolean))].sort(),
//         [rawItems]);

//     const availableCategories: CategoryData[] = useMemo(() => {
//         if (categoriesData && categoriesData.length > 0) return categoriesData;
//         return [];
//     }, [categoriesData]);

//     const availableSubcategories = useMemo(() => {
//         if (!selectedCategory) return [];
//         const cat = availableCategories.find((c) => String(c.id) === String(selectedCategory));
//         return cat ? cat.children : [];
//     }, [selectedCategory, availableCategories]);

//     // --- 5. Filtering & Sorting Logic ---
//     const filteredAndSortedItems = useMemo(() => {
//         let result = rawItems.filter(item => {
//             const matchesSearch = searchTerm === '' ||
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesLocation = selectedLocation === '' || item.location === selectedLocation;
//             const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
//             const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
//             return matchesSearch && matchesLocation && matchesCategory && matchesSubcategory;
//         });

//         if (sortOption === 'price_asc') {
//             result.sort((a, b) => a.price - b.price);
//         } else if (sortOption === 'price_desc') {
//             result.sort((a, b) => b.price - a.price);
//         } else if (sortOption === 'rating') {
//             result.sort((a, b) => b.rating - a.rating);
//         } else if (sortOption === 'popular') {
//             result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
//         }
//         return result;
//     }, [rawItems, searchTerm, selectedLocation, selectedCategory, selectedSubcategory, sortOption]);

//     // --- Handlers ---
//     const handleToggleFav = async (e: React.MouseEvent, id: string, type: string) => {
//         e.preventDefault();
//         e.stopPropagation();
//         const isCurrentlyFav = favorites.includes(id);
//         const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
//         setFavorites(newFavorites);
//         try {
//             await fetch('/api/favorites/toggle', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ itemId: id, type: type.toUpperCase() })
//             });
//         } catch (error) {
//             console.error(error);
//             setFavorites(favorites);
//         }
//     };

//     const handleCategoryClick = (id: string) => {
//         if (selectedCategory === id) {
//             setSelectedCategory('');
//         } else {
//             setSelectedCategory(id);
//         }
//         setSelectedSubcategory('');
//     }

//     const resetFilters = () => {
//         setSearchTerm('');
//         setSelectedLocation('');
//         setSelectedCategory('');
//         setSelectedSubcategory('');
//         setSortOption('');
//         setShowMobileFilters(false);
//         router.push('/services');
//     };

//     return (
//         <section className="min-h-screen bg-slate-50 text-slate-800 pb-20">

//             {/* --- SEARCH & FILTERS CONTAINER --- */}
//             <div className="container mx-auto max-w-6xl px-4 mt-8 relative z-10">
//                 <ServiceFilters
//                     searchTerm={searchTerm}
//                     setSearchTerm={setSearchTerm}
//                     selectedCategory={selectedCategory}
//                     setSelectedCategory={setSelectedCategory}
//                     selectedSubcategory={selectedSubcategory}
//                     setSelectedSubcategory={setSelectedSubcategory}
//                     selectedLocation={selectedLocation}
//                     setSelectedLocation={setSelectedLocation}
//                     sortOption={sortOption}
//                     setSortOption={setSortOption}
//                     showMobileFilters={showMobileFilters}
//                     setShowMobileFilters={setShowMobileFilters}
//                     availableCategories={availableCategories}
//                     availableSubcategories={availableSubcategories}
//                     uniqueLocations={uniqueLocations}
//                     resetFilters={resetFilters}
//                     resultCount={filteredAndSortedItems.length}
//                 />
//             </div>

//             {/* --- POPULAR CATEGORIES --- */}
//             <div className="container mx-auto max-w-6xl px-4 mt-10">
//                 <div className="flex justify-between items-end mb-6 px-1">
//                     <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//                         <FaScrewdriverWrench className="text-brand-500" /> Popular Services
//                     </h2>
//                     <button
//                         onClick={resetFilters}
//                         className="text-xs font-bold text-slate-500 hover:text-brand-600 uppercase tracking-wide"
//                     >
//                         View All
//                     </button>
//                 </div>

//                 {/* Updated grid: grid-cols-2 on mobile (for 4 items), md:grid-cols-6 on desktop (for 6 items) */}
//                 <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
//                     {availableCategories.length > 0 ? (
//                         // We iterate 6 items, but hide index 4 & 5 on mobile using CSS
//                         availableCategories.slice(0, 6).map((cat: any, index: number) => (
//                             <div
//                                 onClick={() => handleCategoryClick(cat.id)}
//                                 key={cat.id}
//                                 // LOGIC: if index > 3 (meaning 5th or 6th item), add 'hidden md:flex'
//                                 className={`
//                     ${index > 3 ? 'hidden md:flex' : 'flex'} 
//                     border p-4 rounded-xl text-center transition cursor-pointer active:scale-95 group flex-col items-center justify-center h-32
//                     ${String(selectedCategory) === String(cat.id)
//                                         ? 'bg-slate-900 border-slate-900 shadow-md'
//                                         : 'bg-white border-gray-100 hover:shadow-md'
//                                     }
//                 `}
//                             >
//                                 <div className="w-24 h-12 mb-3 relative group-hover:scale-110 transition flex items-center justify-center">
//                                     {cat.image ? (
//                                         <img
//                                             src={cat.image}
//                                             alt={cat.name}
//                                             // fill
//                                             className="object-contain"
//                                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                                         />
//                                     ) : (
//                                         <div className={`
//                         w-full h-full rounded-lg flex items-center justify-center text-xl
//                         ${String(selectedCategory) === String(cat.id) ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-600'}
//                     `}>
//                                             <FaScrewdriverWrench />
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className={`
//                     text-xs font-bold uppercase tracking-wide line-clamp-2
//                     ${String(selectedCategory) === String(cat.id) ? 'text-white' : 'text-slate-700'}
//                 `}>
//                                     {cat.name}
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-span-full text-center text-gray-400 text-sm py-8">
//                             No service categories found.
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* --- RESULTS GRID --- */}
//             <div className="container mx-auto max-w-6xl px-4 py-8">
//                 {servLoading ? <ExplorerSkeleton /> : (
//                     <div className="animate-in fade-in duration-500">
//                         {filteredAndSortedItems.length === 0 ? (
//                             <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
//                                 <div className="p-4 bg-slate-50 rounded-full mb-4">
//                                     <SearchX className="text-slate-400" size={40} />
//                                 </div>
//                                 <h4 className="text-xl font-bold text-slate-800">No services found</h4>
//                                 <p className="text-slate-500 max-w-xs mx-auto mt-2">
//                                     Try adjusting your filters or search for something else.
//                                 </p>
//                                 <button onClick={resetFilters} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
//                                     View All Services
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                                 {filteredAndSortedItems.map((item) => (
//                                     <ServiceCard
//                                         key={item.id}
//                                         service={item}
//                                         isFav={favorites.includes(item.id)}
//                                         toggleFav={(e) => handleToggleFav(e!, item.id, item.type)}
//                                         currentUser={currentUser}
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </section>
//     );
// }

'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

// Icons
import { SearchX } from 'lucide-react';

// Components
import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard';
import ServiceFilters, { CategoryData } from './ServiceFilters';
import ServiceCategories from '../home/ServiceCategories';

// --- TYPES ---
interface ExplorerItem extends ServiceProps {
    categoryId?: string | number;
    categoryName: string;
    subcategoryId?: string | number;
    subcategoryName?: string;
    reviewCount?: number;
}

// --- SKELETON LOADER ---
export function ExplorerSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-4">
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
export default function ServicesExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- 1. State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters State
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [sortOption, setSortOption] = useState('');

    // --- 2. Data Fetching ---
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            const data = await res.json();
            setFavorites(data.services || []);
            return data;
        },
        staleTime: 0,
    });

    const { data: apiResponse, isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/provider/services?limit=100');
            return res.json();
        },
        staleTime: 1000 * 60 * 1,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    // --- 3. Data Normalization ---
    const rawItems: ExplorerItem[] = useMemo(() => {
        if (!apiResponse) return [];
        const services = apiResponse.services || [];

        const mapItem = (item: any, type: 'Service' | 'Rental') => ({
            id: item.id,
            name: item.name,
            categoryId: item.category?.id,
            categoryName: item.category?.name || "General",
            subcategoryId: item.subcategory?.id,
            subcategoryName: item.subcategory?.name,
            price: Number(item.price) || 0,
            priceType: item.priceType || 'FIXED',
            rating: Number(item.rating) || 0,
            reviewCount: item._count?.reviews || 0,
            location: item.city || "Remote",
            image: type === 'Service'
                ? (item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80")
                : (item.rentalImg || item.coverImg || "https://images.unsplash.com/photo-1503951458645-643d53633299?auto=format&fit=crop&q=80"),
            type: type
        });

        return [...services.map((s: any) => mapItem(s, 'Service'))];
    }, [apiResponse]);

    // --- 4. Dynamic Filter Options ---
    const uniqueLocations = useMemo(() =>
        [...new Set(rawItems.map(i => i.location).filter(Boolean))].sort(),
        [rawItems]);

    // Using `any` casting here if CategoryData (from ServiceFilters) 
    // doesn't explicitly have `image` typed, but the API returns it.
    const availableCategories: any[] = useMemo(() => {
        if (categoriesData && categoriesData.length > 0) return categoriesData;
        return [];
    }, [categoriesData]);

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: any) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    // --- 5. Filtering & Sorting Logic ---
    const filteredAndSortedItems = useMemo(() => {
        let result = rawItems.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = selectedLocation === '' || item.location === selectedLocation;
            const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
            const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
            return matchesSearch && matchesLocation && matchesCategory && matchesSubcategory;
        });

        if (sortOption === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'popular') {
            result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        }
        return result;
    }, [rawItems, searchTerm, selectedLocation, selectedCategory, selectedSubcategory, sortOption]);

    // --- Handlers ---
    const handleToggleFav = async (e: React.MouseEvent, id: string, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
        setFavorites(newFavorites);
        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: type.toUpperCase() })
            });
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSortOption('');
        setShowMobileFilters(false);
        router.push('/services');
    };

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-4 md:pt-6">

            {/* --- POPULAR CATEGORIES --- */}
            <div className="container mx-auto max-w-6xl px-4">
                <ServiceCategories categories={availableCategories} />
            </div>

            {/* --- SEARCH & FILTERS CONTAINER --- */}
            <div className="container mx-auto max-w-6xl px-4 mt-6 relative z-10">
                <ServiceFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    showMobileFilters={showMobileFilters}
                    setShowMobileFilters={setShowMobileFilters}
                    availableCategories={availableCategories}
                    availableSubcategories={availableSubcategories}
                    uniqueLocations={uniqueLocations}
                    resetFilters={resetFilters}
                    resultCount={filteredAndSortedItems.length}
                />
            </div>

            {/* --- RESULTS GRID --- */}
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {servLoading ? <ExplorerSkeleton /> : (
                    <div className="animate-in fade-in duration-500">
                        {filteredAndSortedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <SearchX className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No services found</h4>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    Try adjusting your filters or search for something else.
                                </p>
                                <button onClick={resetFilters} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                    View All Services
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredAndSortedItems.map((item) => (
                                    <ServiceCard
                                        key={item.id}
                                        service={item}
                                        isFav={favorites.includes(item.id)}
                                        toggleFav={(e) => handleToggleFav(e!, item.id, item.type)}
                                        currentUser={currentUser}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}