'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaArrowLeft, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { Filter, PackageOpen, MapPin } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

// --- TYPES ---
interface ProductItem {
    id: string;
    name: string;
    description: string;
    price: number;
    minOrderQty: number;
    unit: string;
    images: string[];
    categoryId?: string;
    categoryName: string;
    subcategoryId?: string;
    subcategoryName?: string;
    rating: number;
    reviewsCount: number;
    inStock: boolean;
    location: string;
    provider: {
        id: string;
        name: string;
        shopName: string;
        image: string;
        verified: boolean;
    };
}

interface CategoryData {
    id: string;
    name: string;
    children: { id: string; name: string }[];
}

// --- SKELETON LOADER (Exported so page can use it too if needed) ---
export function ProductsSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border h-80 flex flex-col overflow-hidden">
                        <div className="h-40 bg-slate-200"></div>
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
export default function ProductsExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- 1. State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    // Filters State
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortOption, setSortOption] = useState('');

    // --- 2. Data Fetching ---

    // Current User Profile
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // User Favorites
    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { products: [] };
            const data = await res.json();
            setFavorites(data.products || []);
            return data;
        },
        staleTime: 0,
    });

    // Fetch Products
    const { data: apiResponse, isLoading: prodLoading } = useQuery({
        queryKey: ['products', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/products/all?limit=100');
            return res.json();
        },
        staleTime: 1000 * 60 * 1,
    });

    // Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'product'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=PRODUCT');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    // --- 3. Data Normalization ---
    const rawItems: ProductItem[] = useMemo(() => {
        if (!apiResponse || !apiResponse.products) return [];

        return apiResponse.products.map((item: any) => {
            let rawImageList: string[] = [];
            if (Array.isArray(item.images) && item.images.length > 0) {
                rawImageList = item.images;
            } else if (item.image && typeof item.image === 'string' && item.image.trim() !== "") {
                rawImageList = [item.image];
            }
            const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
            if (validImages.length === 0) {
                validImages.push("https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80");
            }

            return {
                id: item.id,
                name: item.name,
                description: item.description,
                price: Number(item.price) || 0,
                minOrderQty: item.moq || 1,
                unit: item.unit || 'pcs',
                images: validImages,
                categoryId: item.category?.id,
                categoryName: item.category?.name || "General",
                subcategoryId: item.subcategory?.id,
                subcategoryName: item.subcategory?.name,
                rating: item.rating || 0,
                reviewsCount: item._count?.reviews || 0,
                inStock: true,
                location: item.city || item.user?.city || "Worldwide",
                provider: {
                    id: item.user?.id,
                    name: item.user?.name,
                    shopName: item.supplier || item.user?.shopName || "Seller",
                    image: item.user?.profileImage || item.user?.image || "",
                    verified: item.isVerified || false
                }
            };
        });
    }, [apiResponse]);

    // --- 4. Dynamic Filter Options ---

    // Locations
    const uniqueLocations = useMemo(() => {
        const locs = new Set(rawItems.map(i => i.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [rawItems]);

    // Categories
    const availableCategories = useMemo(() => {
        if (categoriesData && categoriesData.length > 0) return categoriesData;
        const uniqueCats = new Map();
        rawItems.forEach(item => {
            if (item.categoryId && !uniqueCats.has(item.categoryId)) {
                uniqueCats.set(item.categoryId, { id: item.categoryId, name: item.categoryName, children: [] });
            }
        });
        return Array.from(uniqueCats.values());
    }, [categoriesData, rawItems]);

    // Subcategories
    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c: CategoryData) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    // --- 5. Filtering & Sorting Logic ---
    const filteredAndSortedItems = useMemo(() => {
        let result = rawItems.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === '' || String(item.categoryId) === String(selectedCategory);
            const matchesSubcategory = selectedSubcategory === '' || String(item.subcategoryId) === String(selectedSubcategory);
            const matchesLocation = selectedLocation === '' || item.location === selectedLocation;

            return matchesSearch && matchesCategory && matchesSubcategory && matchesLocation;
        });

        // Sorting
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
    }, [rawItems, searchTerm, selectedCategory, selectedSubcategory, selectedLocation, sortOption]);

    // --- Handlers ---
    const handleToggleFav = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
        setFavorites(newFavorites);

        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'PRODUCT' })
            });
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedLocation('');
        setSortOption('');
        router.push('/products');
    };

    return (
        <section className="min-h-screen bg-slate-50 text-slate-800 pb-20">

            {/* --- PAGE HEADER --- */}
            <div className="bg-gradient-to-b from-blue-50 to-white pt-10 pb-20 px-4 border-b border-slate-200">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full transition shadow-sm"
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Wholesale Market</h1>
                    </div>
                    <p className="text-slate-500 max-w-xl text-lg font-medium">
                        Source high-quality products directly from verified manufacturers and distributors.
                    </p>
                </div>
            </div>

            {/* --- SEARCH & FILTERS CONTAINER --- */}
            <div className="container mx-auto max-w-6xl px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">

                    {/* Search Row */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FaMagnifyingGlass />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products, suppliers, or categories..."
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
                        <button className="bg-slate-900 text-white px-6 md:px-8 rounded-xl font-bold hover:bg-slate-800 transition hidden md:block">
                            Search
                        </button>
                    </div>

                    {/* Filter Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                        {/* 1. Category */}
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
                                {availableCategories.map((cat: CategoryData) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* 2. Subcategory */}
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

                        {/* 3. Location */}
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

                        {/* 4. Sort */}
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

            {/* --- RESULTS GRID --- */}
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {prodLoading ? <ProductsSkeleton /> : (
                    <div className="animate-in fade-in duration-500">
                        {filteredAndSortedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <PackageOpen className="text-slate-400" size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">No products found</h4>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    Try adjusting your filters or search for something else.
                                </p>
                                <button onClick={resetFilters} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                    View All Products
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedItems.map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        product={item}
                                        isFav={favorites.includes(item.id)}
                                        toggleFav={(e) => handleToggleFav(e!, item.id)}
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