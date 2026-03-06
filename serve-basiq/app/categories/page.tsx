'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ Added router and searchParams
import { useQuery } from '@tanstack/react-query';
import {
    FaArrowLeft,
    FaWrench,
    FaBoxOpen,
    FaKey,
    FaLayerGroup,
    FaMagnifyingGlass,
    FaXmark,
    FaChevronRight
} from 'react-icons/fa6';
import { Loader2, Sparkles, FolderOpen } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

// --- Types ---
type SubCategory = {
    id: string;
    name: string;
    image: string | null;
};

type Category = {
    id: string;
    name: string;
    image: string | null;
    type: 'SERVICE' | 'PRODUCT' | 'RENTAL' | 'BOTH';
    children: SubCategory[];
};

// --- Helper Components ---
const TypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, string> = {
        SERVICE: "bg-purple-50 text-purple-700 border-purple-100",
        PRODUCT: "bg-emerald-50 text-emerald-700 border-emerald-100",
        RENTAL: "bg-orange-50 text-orange-700 border-orange-100",
        BOTH: "bg-blue-50 text-blue-700 border-blue-100",
        DEFAULT: "bg-gray-50 text-gray-600 border-gray-100"
    };

    const styles = config[type] || config.DEFAULT;

    return (
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${styles} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            {type}
        </span>
    );
};

// ✅ Main Logic Component
function CategoriesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategoryId = searchParams.get('categoryId'); // Check URL for categoryId

    // --- State ---
    const [activeTab, setActiveTab] = useState<'ALL' | 'SERVICE' | 'PRODUCT' | 'RENTAL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // --- Data Fetching ---
    const { data: allCategories = [], isLoading } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<Category[]>;
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    // ✅ NEW: Auto-select category if they clicked it from the home page
    useEffect(() => {
        if (allCategories.length > 0 && initialCategoryId && !selectedCategory) {
            const foundCat = allCategories.find(c => c.id === initialCategoryId);
            if (foundCat) {
                setSelectedCategory(foundCat);
            }
        }
    }, [allCategories, initialCategoryId, selectedCategory]);

    const processedData = useMemo(() => {
        let data = allCategories;

        if (activeTab !== 'ALL') {
            data = data.filter(cat => cat.type === activeTab || cat.type === 'BOTH');
        }

        const query = searchQuery.toLowerCase();
        if (query) {
            if (selectedCategory) {
                return data;
            } else {
                data = data.filter(cat =>
                    cat.name.toLowerCase().includes(query) ||
                    cat.children.some(sub => sub.name.toLowerCase().includes(query))
                );
            }
        }
        return data;
    }, [allCategories, activeTab, searchQuery, selectedCategory]);

    const displayItems = useMemo(() => {
        if (selectedCategory) {
            const query = searchQuery.toLowerCase();
            return selectedCategory.children.filter(sub =>
                sub.name.toLowerCase().includes(query)
            );
        }
        return processedData;
    }, [selectedCategory, processedData, searchQuery]);

    const handleCategoryClick = (cat: Category) => {
        setSelectedCategory(cat);
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToMain = () => {
        setSelectedCategory(null);
        setSearchQuery('');
        router.push('/categories'); // ✅ Clears the URL parameter when going back
    };

    const getIcon = (type: string, size = 24) => {
        switch (type) {
            case 'SERVICE': return <FaWrench size={size} className="text-purple-500" />;
            case 'PRODUCT': return <FaBoxOpen size={size} className="text-emerald-500" />;
            case 'RENTAL': return <FaKey size={size} className="text-orange-500" />;
            default: return <FaLayerGroup size={size} className="text-indigo-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* --- STICKY HEADER --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Back Button & Title */}
                        <div className="flex items-center gap-3 min-w-fit">
                            {selectedCategory ? (
                                <button
                                    onClick={handleBackToMain}
                                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors group"
                                >
                                    <FaArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors">
                                    <FaArrowLeft size={18} />
                                </Link>
                            )}

                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                    {selectedCategory ? selectedCategory.name : 'Explore Categories'}
                                </h1>
                                {selectedCategory && (
                                    <p className="text-[10px] md:text-xs text-zinc-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                        <span className="uppercase">{activeTab === 'ALL' ? 'All' : activeTab}</span>
                                        <FaChevronRight size={8} />
                                        Subcategories
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaMagnifyingGlass className="text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder={selectedCategory ? `Search in ${selectedCategory.name}...` : "Find services, equipment, or products..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-10 py-2.5 md:py-3 bg-zinc-100/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <FaXmark />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs (Only show on main view) */}
                    {!selectedCategory && (
                        <div className="mt-3 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-2 pb-1">
                                {['ALL', 'SERVICE', 'PRODUCT', 'RENTAL'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`
                                            px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                                            ${activeTab === tab
                                                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/10 scale-[1.02]'
                                                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                                            }
                                        `}
                                    >
                                        {tab === 'ALL' ? 'All Items' : tab.charAt(0) + tab.slice(1).toLowerCase() + 's'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-32">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <Loader2 className="animate-spin text-indigo-600 relative z-10" size={48} />
                        </div>
                        <p className="text-zinc-400 font-medium text-sm animate-pulse">Loading categories...</p>
                    </div>
                ) : allCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-zinc-200 mx-auto max-w-lg mt-8">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <FolderOpen className="text-indigo-400" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-2">No Categories Yet</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                            It looks like there are no categories available on the platform right now. Check back later!
                        </p>
                        <Link href="/" className="mt-8 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                            Return Home
                        </Link>
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200 mx-auto max-w-lg">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                            <Sparkles className="text-zinc-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800">No matches found</h3>
                        <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                            We couldn't find anything matching "{searchQuery}". Try a different keyword.
                        </p>
                        {selectedCategory && (
                            <button onClick={handleBackToMain} className="mt-6 px-6 py-2 bg-white border border-zinc-200 rounded-full text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                                Back to All Categories
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {selectedCategory ? (
                            // SUBCATEGORY VIEW
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {(displayItems as SubCategory[]).map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={
                                                selectedCategory.type === 'SERVICE'
                                                    ? `/services?category=${selectedCategory.id}&subcategory=${sub.id}`
                                                    : selectedCategory.type === 'RENTAL'
                                                        ? `/rentals?category=${selectedCategory.id}&subcategory=${sub.id}`
                                                        : `/products?category=${selectedCategory.id}&subcategory=${sub.id}`
                                            }
                                            className="group relative bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center h-full"
                                        >
                                            <div className="w-full aspect-square mb-4 rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100 group-hover:border-indigo-500/10 transition-colors relative">
                                                {sub.image ? (
                                                    <AppImage
                                                        src={sub.image}
                                                        alt={sub.name}
                                                        type="thumbnail"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-black text-zinc-200 group-hover:text-indigo-200 transition-colors">
                                                        {sub.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-auto">
                                                <h3 className="text-sm font-bold text-zinc-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                    {sub.name}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // MAIN CATEGORY VIEW
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {(displayItems as Category[]).map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat)}
                                        className="group relative bg-white rounded-3xl p-1 shadow-sm border border-zinc-200 cursor-pointer hover:shadow-2xl hover:shadow-indigo-900/5 hover:border-indigo-200 transition-all duration-300"
                                    >
                                        <div className="relative h-full bg-white rounded-[20px] p-5 md:p-6 flex flex-col justify-between overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm group-hover:scale-105 transition-transform duration-300 relative">
                                                    {cat.image ? (
                                                        <AppImage
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            type="thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        getIcon(cat.type, 28)
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <TypeBadge type={cat.type} />
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-lg md:text-xl font-bold text-zinc-800 group-hover:text-indigo-600 transition-colors">
                                                    {cat.name}
                                                </h3>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm text-zinc-500 font-medium">
                                                        {cat.children.length} subcategories
                                                    </p>
                                                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                        <FaChevronRight size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function AllCategoriesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        }>
            <CategoriesContent />
        </Suspense>
    );
}