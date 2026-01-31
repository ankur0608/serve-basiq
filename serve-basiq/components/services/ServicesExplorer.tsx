'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query'; 
import { FaFire, FaArrowLeft } from 'react-icons/fa6';
import { SearchX, ImageOff } from 'lucide-react';
import ServiceCard from '@/components/ui/ServiceCard';

// ✅ Skeleton Component
function ExplorerSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded mb-10"></div>
            <div className="mb-12">
                <div className="h-4 w-32 bg-slate-200 rounded mb-5"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
                    ))}
                </div>
            </div>
            <div>
                <div className="h-8 w-40 bg-slate-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-slate-200 rounded-3xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ✅ FIX: Ensure NO props are defined here
export default function ServicesExplorer() {
    const router = useRouter();

    // 1️⃣ Query for Categories
    const { data: categories = [], isLoading: catLoading } = useQuery({
        queryKey: ['categories', 'SERVICE'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 Hours
    });

    // 2️⃣ Query for Services
    const { data: rawServices = [], isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/services?limit=12');
            return res.json();
        },
        staleTime: 1000 * 60 * 1, // 1 Minute
    });

    const services = Array.isArray(rawServices) ? rawServices.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category?.name || "General",
        price: Number(item.price) || 0,
        priceType: item.priceType,
        rating: 4.5,
        location: item.city || "Remote",
        image: item.serviceimg || item.mainimg || item.user?.profileImage || item.user?.image || "https://placehold.co/600x400?text=No+Image",
        isVerified: true
    })) : [];

    const loading = catLoading || servLoading;

    return (
        <section className="min-h-screen bg-[#F8F9FC] text-slate-800 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="mb-10">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 mb-6 transition-all uppercase tracking-widest">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    {!loading && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Explore Services</h2>
                            <p className="text-slate-500 font-medium">Verified experts at your fingertips.</p>
                        </div>
                    )}
                </div>

                {loading ? <ExplorerSkeleton /> : (
                    <div className="animate-in fade-in duration-500">
                        {/* Categories */}
                        <div className="mb-12">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-5">Browse Categories</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.map((cat: any) => (
                                    <div key={cat.id} onClick={() => router.push(`/services/category/${cat.id}`)} className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all active:scale-95 group flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 bg-slate-50 relative border border-slate-100 group-hover:border-blue-100 transition-colors">
                                            {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><ImageOff size={24} /></div>}
                                        </div>
                                        <h4 className="font-bold text-xs text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">{cat.name}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FaFire className="text-orange-500 animate-pulse" /> Popular Near You</h3>
                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{services.length} Services Found</div>
                        </div>

                        {services.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center">
                                <SearchX className="mx-auto text-slate-300 mb-4" size={60} />
                                <h4 className="text-xl font-bold text-slate-800">No Services Available</h4>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.map((service, i) => (
                                    <ServiceCard key={service.id} service={service} isFav={false} toggleFav={() => { }} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}