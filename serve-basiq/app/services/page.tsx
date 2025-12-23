'use client';

import { useState, useEffect } from 'react';
import ServiceCard from '@/components/ui/ServiceCard';
import { FaMagnifyingGlass, FaSliders } from 'react-icons/fa6';
import clsx from 'clsx';
import { Service } from '@/type/service';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Safe categories (ignore null)
  const categories = [
    'All',
    ...Array.from(
      new Set(services.map(s => s.cat).filter(Boolean))
    ),
  ] as string[];

  // ✅ SAFE FILTER (NO CRASH)
  const filteredServices = services.filter((service) => {
    const name = service.name?.toLowerCase() ?? '';
    const cat = service.cat?.toLowerCase() ?? '';
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(query) || cat.includes(query);

    const matchesCategory =
      activeCategory === 'All' || service.cat === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20">

      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30 pt-6 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Find a Professional</h1>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search plumbers, electricians..."
                className="w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-4"
              />
            </div>
            <button className="bg-slate-50 border px-4 rounded-xl font-bold flex items-center gap-2">
              <FaSliders /> Filters
            </button>
          </div>

          {!isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    'px-5 py-2 rounded-full text-xs font-bold border',
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-gray-600'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold">No professionals found</h3>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="mt-6 text-blue-600 font-bold"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
