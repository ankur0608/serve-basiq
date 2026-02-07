'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaWrench,
    FaBoxOpen,
    FaKey,
    FaLayerGroup,
    FaChevronRight
} from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';

// Types
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

export default function AllCategoriesPage() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'SERVICE' | 'PRODUCT' | 'RENTAL'>('ALL');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Data when Tab changes
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                // If ALL, we don't send a type param (or handle it in API)
                const query = activeTab === 'ALL' ? '' : `?type=${activeTab}`;
                const res = await fetch(`/api/categories${query}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [activeTab]);

    // Helper for icons
    const getIcon = (type: string) => {
        switch (type) {
            case 'SERVICE': return <FaWrench className="text-purple-500" />;
            case 'PRODUCT': return <FaBoxOpen className="text-green-500" />;
            case 'RENTAL': return <FaKey className="text-orange-500" />;
            default: return <FaLayerGroup className="text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* --- Header --- */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600">
                            <FaArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">All Categories</h1>
                    </div>

                    {/* --- Tabs --- */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['ALL', 'SERVICE', 'PRODUCT', 'RENTAL'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {tab === 'ALL' ? 'All Categories' : tab.charAt(0) + tab.slice(1).toLowerCase() + 's'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Content --- */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No categories found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Main Category Header */}
                                <div className="p-5 flex items-start gap-4 border-b border-gray-50">
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                {getIcon(cat.type)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{cat.name}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${cat.type === 'RENTAL' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                cat.type === 'SERVICE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {cat.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {cat.children.length} Subcategories
                                        </p>
                                    </div>
                                </div>

                                {/* Subcategories List */}
                                <div className="bg-gray-50/50 p-3">
                                    {cat.children.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {cat.children.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    // Logic: Direct to specific filtered page based on type
                                                    href={cat.type === 'SERVICE'
                                                        ? `/services?category=${cat.id}&subcategory=${sub.id}`
                                                        : cat.type === 'RENTAL'
                                                            ? `/rentals?category=${cat.id}&subcategory=${sub.id}`
                                                            : `/products?category=${cat.id}&subcategory=${sub.id}`
                                                    }
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {sub.image ? (
                                                            <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-gray-300 text-[10px]">•</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 line-clamp-1">
                                                        {sub.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 text-xs text-gray-400 italic">
                                            No subcategories yet
                                        </div>
                                    )}
                                </div>

                                {/* View All Link */}
                                <div className="p-3 border-t border-gray-100 text-center">
                                    <Link
                                        href={cat.type === 'RENTAL' ? `/rentals?category=${cat.id}` : cat.type === 'PRODUCT' ? `/products?category=${cat.id}` : `/services?category=${cat.id}`}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                                    >
                                        Browse all {cat.name} <FaChevronRight size={10} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}