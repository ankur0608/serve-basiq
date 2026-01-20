'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaFilter } from 'react-icons/fa6';
import ServiceCard from '@/components/ui/ServiceCard';

// UI Configuration Map
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

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();

    // 🛡️ Safety: Ensure categoryId is a string, even if params are empty or array
    const rawId = params?.id;
    const categoryId = Array.isArray(rawId) ? rawId[0] : (rawId || "");

    const [services, setServices] = useState<any[]>([]);

    // 🛡️ Safety: Only manipulate string if it exists
    const [categoryName, setCategoryName] = useState(
        categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : "Category"
    );

    const [loading, setLoading] = useState(true);

    const categoryStyle = STYLE_MAP[categoryId] || STYLE_MAP.default;

    useEffect(() => {
        if (!categoryId) return; // Don't fetch if ID is missing

        const initData = async () => {
            try {
                // 1. Fetch Categories to find the correct Display Name (e.g. "Pest Control" vs "pest-control")
                // We fetch all SERVICE categories and find the match
                const catRes = await fetch('/api/categories?type=SERVICE');
                const catData = await catRes.json();

                if (Array.isArray(catData)) {
                    const currentCat = catData.find((c: any) => c.id === categoryId);
                    if (currentCat) setCategoryName(currentCat.name);
                }

                // 2. Fetch Services for this category
                const res = await fetch(`/api/services/all?cat=${categoryId}`, {
                    next: { revalidate: 60 } // Cache for 60s for speed
                });

                const rawData = await res.json();
                const items = Array.isArray(rawData) ? rawData : [];

                const formatted = items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category?.name || "General",
                    price: Number(item.price) || 0,
                    priceType: item.priceType || 'FIXED',
                    rating: Number(item.rating) || 0,
                    location: item.city || "Nearby",
                    image: item.mainimg || item.user?.image || "https://placehold.co/400",
                    isVerified: item.isVerified
                }));

                setServices(formatted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [categoryId]);

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm font-bold mb-4">
                        <FaArrowLeft /> Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-${categoryStyle.color}-50 text-${categoryStyle.color}-600`}>
                            {categoryStyle.emoji}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 capitalize">
                                {categoryName}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {services.length} professionals available
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : services.length > 0 ? (
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
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl text-gray-200 mb-4 flex justify-center"><FaFilter /></div>
                        <p className="text-gray-400">No services found in this category yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}