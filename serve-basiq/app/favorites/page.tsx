'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaArrowLeft, FaHeart, FaBoxOpen, FaBriefcase } from 'react-icons/fa6';
import { HeartCrack } from 'lucide-react';
import ServiceCard from '@/components/ui/ServiceCard';
import ProductCard from '@/components/ui/ProductCard';

export default function FavoritesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES');

    // 1. Fetch Detailed Favorites
    const { data, isLoading } = useQuery({
        queryKey: ['favorites', 'details'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites/details');
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        },
    });

    // 2. Remove Favorite Mutation (to update UI instantly)
    const toggleFavMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: 'SERVICE' | 'PRODUCT' }) => {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                body: JSON.stringify({ itemId: id, type }),
            });
        },
        onSuccess: () => {
            // Refetch to remove the item from the list
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        }
    });

    const services = data?.services || [];
    const products = data?.products || [];
    const activeList = activeTab === 'SERVICES' ? services : products;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FaHeart className="text-pink-500" /> My Favorites
                    </h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Tabs */}
                <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200 mb-8 max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'SERVICES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <FaBriefcase /> Services ({services.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('PRODUCTS')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'PRODUCTS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <FaBoxOpen /> Products ({products.length})
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />)}
                    </div>
                ) : activeList.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-pink-50 text-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HeartCrack size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No favorites yet</h3>
                        <p className="text-slate-500 text-sm">Save items you like to find them later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'SERVICES'
                            ? services.map((item: any) => (
                                <ServiceCard
                                    key={item.id}
                                    service={item}
                                    isFav={true} // It's in favorites page, so it's always true
                                    toggleFav={() => toggleFavMutation.mutate({ id: item.id, type: 'SERVICE' })}
                                />
                            ))
                            : products.map((item: any) => (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                    isFav={true}
                                    toggleFav={(e: any) => {
                                        e.preventDefault();
                                        toggleFavMutation.mutate({ id: item.id, type: 'PRODUCT' });
                                    }}
                                />
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
}