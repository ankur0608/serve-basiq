'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMagnifyingGlass, FaSliders } from 'react-icons/fa6';
import clsx from 'clsx';
import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard'; // ✅ Use shared interface

export default function ServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Use the interface from your Card component
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      console.log("🚀 Starting fetch request...");

      try {
        const res = await fetch('/api/services/all');
        if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);

        const rawData = await res.json();
        console.log("📦 Raw DB Data:", rawData);

        // ✅ CRITICAL STEP: Map DB fields to UI fields
        const formattedData = rawData.map((item: any) => ({
          id: item.id,
          // 1. Prefer the "Service Brand Name" (e.g., Joe's Plumbing), fallback to User Name
          name: item.name || item.user?.name || "Service Provider",

          // 2. Map 'categoryId' (DB) to 'cat' (UI)
          cat: item.categoryId || item.cat || "General",

          // 3. Map 'city' (DB) to 'loc' (UI)
          loc: item.city ? `${item.city}, ${item.state || ''}` : item.loc,

          // 4. Ensure numbers
          price: Number(item.price) || 0,
          rating: Number(item.rating) || 0,

          // 5. Images
          img: item.mainimg || "/default-avatar.png",
          verified: item.user?.isVerified || false
        }));

        setServices(formattedData);

      } catch (error) {
        console.error("❌ Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filter Logic
  const filteredServices = services.filter((service) => {
    const categoryName = service.cat || '';

    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'All' || service.cat === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract Categories (Safe Filter)
  const categories = Array.from(new Set(
    services
      .map(s => s.cat)
      .filter((cat): cat is string => typeof cat === 'string' && cat.length > 0)
  ));

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 top-16 z-30 pt-6 pb-4 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Find a Professional</h1>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services, experts..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-slate-50 border border-gray-200 text-slate-700 px-4 rounded-xl font-bold hover:bg-slate-100 transition flex items-center gap-2">
              <FaSliders /> <span className="hidden md:inline">Filters</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setActiveCategory('All')}
              className={clsx("px-5 py-2 rounded-full text-xs font-bold transition border whitespace-nowrap", activeCategory === 'All' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-600 border-gray-200")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx("px-5 py-2 rounded-full text-xs font-bold transition border whitespace-nowrap", activeCategory === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 font-medium">
          Showing {filteredServices.length} results
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading services...</div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900">No professionals found</h3>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="mt-6 text-blue-600 font-bold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}