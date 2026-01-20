'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaFire, FaArrowLeft } from 'react-icons/fa6';
import ServiceCard from '@/components/ui/ServiceCard';

const STYLE_MAP: Record<string, { emoji: string; color: string }> = {
    cleaning: { emoji: "🧹", color: "blue" },
    repair: { emoji: "🛠️", color: "orange" },
    plumbing: { emoji: "💧", color: "cyan" },
    electrical: { emoji: "⚡", color: "yellow" },
    beauty: { emoji: "💅", color: "pink" },
    painting: { emoji: "🎨", color: "purple" },
    movers: { emoji: "📦", color: "indigo" },
    gardening: { emoji: "🌻", color: "green" },
    "pest-control": { emoji: "🐜", color: "red" },
    carpentry: { emoji: "🪑", color: "amber" },
    catering: { emoji: "🍽️", color: "rose" },
    photography: { emoji: "📸", color: "sky" },
    default: { emoji: "📌", color: "gray" }
};

export default function ServicesExplorer() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ⚡ Fetch ONLY Service Categories + All Services
                const [catRes, servRes] = await Promise.all([
                    fetch('/api/categories?type=SERVICE'),
                    fetch('/api/services/all', { next: { revalidate: 60 } })
                ]);

                let catData = [], servData = [];
                try { catData = await catRes.json(); } catch (e) { console.error(e); }
                try { servData = await servRes.json(); } catch (e) { console.error(e); }

                if (Array.isArray(catData)) setCategories(catData);

                const formattedServices = Array.isArray(servData) ? servData.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category?.name || "General",
                    price: Number(item.price) || 0,
                    priceType: item.priceType || 'FIXED',
                    rating: Number(item.rating) || 0,
                    location: item.city || "Nearby",
                    image: item.mainimg || item.user?.image || "https://placehold.co/400",
                    isVerified: item.isVerified
                })) : [];

                setServices(formattedServices);
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="min-h-screen bg-gray-50 text-slate-800 pb-32">
            <div className="max-w-7xl mx-auto px-4 py-8">

                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Services</h2>
                    <p className="text-gray-500">Find the right expert for every job.</p>
                </div>

                {/* --- Dynamic Categories --- */}
                <div className="mb-10">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Categories</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {categories.length > 0 ? categories.map((cat) => {
                            const style = STYLE_MAP[cat.id] || STYLE_MAP.default;
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => router.push(`/services/category/${cat.id}`)}
                                    className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg cursor-pointer text-center group transition active:scale-95"
                                >
                                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl mb-2 bg-${style.color}-50 text-${style.color}-600 group-hover:scale-110 transition`}>
                                        {style.emoji}
                                    </div>
                                    <h4 className="font-bold text-[10px] text-slate-800 uppercase tracking-wide truncate px-1">
                                        {cat.name}
                                    </h4>
                                </div>
                            );
                        }) : <div className="text-gray-400 text-sm italic col-span-full">Loading categories...</div>}
                    </div>
                </div>

                {/* --- Services List --- */}
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FaFire className="text-orange-500" /> Recent Listings
                </h3>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {services.map((service, i) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                isFav={false}
                                toggleFav={() => { }}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}