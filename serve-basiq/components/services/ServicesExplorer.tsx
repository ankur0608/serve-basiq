// components/services/ServicesExplorer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaMagnifyingGlass,
    FaHeart,
    FaRegHeart,
    FaStar,
    FaLocationDot,
    FaFire,
    FaArrowRight
} from 'react-icons/fa6';
import clsx from 'clsx';

// --- Types ---
interface Service {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    distance?: string;
    location: string;
    image: string;
    isVerified: boolean;
}

// --- Static Categories ---
const CATEGORY_TILES = [
    { name: "Home Maintenance", emoji: "🏠", color: "blue", label: "Home" },
    { name: "Beauty", emoji: "💅", color: "pink", label: "Beauty" },
    { name: "Appliance Repair", emoji: "🔌", color: "cyan", label: "Appliances" },
    { name: "Automobile", emoji: "🚗", color: "red", label: "Auto" },
    { name: "Technology", emoji: "💻", color: "indigo", label: "Tech" },
    { name: "Event", emoji: "🎉", color: "purple", label: "Events" },
];

export default function ServicesExplorer() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);

    // 1. Fetch Data
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services/all', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch');
                const rawData = await res.json();
                const items = Array.isArray(rawData) ? rawData : (rawData.data || []);

                // Map API Data to UI Interface
                const formattedData: Service[] = items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category?.name || "General",
                    location: item.city || "Nearby",
                    price: Number(item.price) || 0,
                    rating: Number(item.rating) || 4.8,
                    distance: "2.5 km",
                    image: item.mainimg || item.serviceimg || "https://images.unsplash.com/photo-1581578731117-10d52143b0d8?w=400",
                    isVerified: item.isVerified || false,
                }));

                setServices(formattedData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // 2. Filter Logic
    const filteredServices = services.filter((service) => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || service.category.includes(activeCategory);
        return matchesSearch && matchesCategory;
    });

    const toggleFav = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <section className="min-h-screen bg-gray-50 text-slate-800 pb-32">

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Services</h2>
                    <p className="text-gray-500">Find the right expert for every job.</p>
                </div>

                {/* Sticky Visual Filter Bar */}
                <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur py-3 mb-8 -mx-4 px-4 border-b border-gray-200/50 flex gap-3 overflow-x-auto no-scrollbar md:static md:bg-transparent md:border-none md:p-0 md:mb-8 md:overflow-visible flex-wrap">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={clsx(
                            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-md active:scale-95 transition",
                            activeCategory === 'All' ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        )}
                    >
                        All Services
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition active:scale-95">
                        Top Rated
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition active:scale-95">
                        Nearby
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:border-blue-500 hover:text-blue-600 transition active:scale-95">
                        Price: Low to High
                    </button>
                </div>

                {/* Popular Categories Grid */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Top Categories</h3>
                        <button className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            View All Categories <FaArrowRight className="text-xs" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {CATEGORY_TILES.map((cat, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveCategory(cat.name)}
                                className={clsx(
                                    "bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg cursor-pointer text-center group transition active:scale-95",
                                    activeCategory === cat.name && "ring-2 ring-blue-500 bg-blue-50"
                                )}
                            >
                                <div className={`w-12 h-12 mx-auto bg-${cat.color}-50 text-${cat.color}-600 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition duration-300`}>
                                    {cat.emoji}
                                </div>
                                <h4 className="font-bold text-[10px] text-slate-800 leading-tight uppercase tracking-wide">
                                    {cat.label}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services List */}
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FaFire className="text-orange-500" /> Popular Providers
                </h3>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredServices.map((service, i) => {
                            const isFav = favorites.includes(service.id);

                            return (
                                <div
                                    key={service.id}
                                    onClick={() => router.push(`/services/${service.id}`)}
                                    className="bg-white p-3 rounded-[1.25rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex gap-4 group h-full relative hover:border-blue-100 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {/* Image Section */}
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            className="w-full h-full rounded-xl object-cover bg-gray-100 group-hover:brightness-95 transition"
                                        />
                                        {service.isVerified && (
                                            <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-1 border-2 border-white shadow-sm z-10" title="Verified">
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 truncate text-base group-hover:text-blue-600 transition leading-tight">
                                                    {service.name}
                                                </h4>
                                                <button
                                                    onClick={(e) => toggleFav(e, service.id)}
                                                    className="text-xs p-1 -mt-1 -mr-1 hover:bg-gray-50 rounded-full transition"
                                                >
                                                    {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-300" />}
                                                </button>
                                            </div>

                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 truncate">
                                                {service.category}
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                                                <FaLocationDot className="text-blue-400" /> {service.distance} • {service.location}
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-gray-50 pt-2 mt-auto">
                                            <span className="text-base font-extrabold text-slate-900">
                                                ₹{service.price}<span className="text-[10px] font-medium text-gray-400">/hr</span>
                                            </span>
                                            <span className="text-[10px] font-bold bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100 flex items-center gap-1">
                                                <FaStar className="text-[9px]" /> {service.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl text-gray-200 mb-4 flex justify-center"><FaMagnifyingGlass /></div>
                        <p className="text-gray-400">No professionals found matching your filters.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="mt-4 text-blue-600 font-bold text-sm">Clear Filters</button>
                    </div>
                )}

            </div>

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 p-4 pb-safe md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                    Explore More Services <FaArrowRight />
                </button>
            </div>

        </section>
    );
}