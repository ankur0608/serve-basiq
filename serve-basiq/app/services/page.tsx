'use client';

import { useState } from 'react';
import { services, categories } from '@/lib/data';
import ServiceCard from '@/components/ui/ServiceCard';
import { FaMagnifyingGlass, FaSliders } from 'react-icons/fa6';
import clsx from 'clsx';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter Logic
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.cat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || service.cat === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const serviceCategories = categories.filter(c => c.type === 'service');

  return (
    <div className="min-h-screen pb-20">
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100  top-16 z-30 pt-6 pb-4 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Find a Professional</h1>
          
          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search plumbers, electricians, cleaners..." 
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-brand-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-slate-50 border border-gray-200 text-slate-700 px-4 rounded-xl font-bold hover:bg-slate-100 transition flex items-center gap-2">
               <FaSliders /> <span className="hidden md:inline">Filters</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setActiveCategory('All')}
              className={clsx(
                "px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border",
                activeCategory === 'All' 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-500 hover:text-brand-600"
              )}
            >
              All
            </button>
            {serviceCategories.map((cat) => (
              <button 
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={clsx(
                  "px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border",
                  activeCategory === cat.name
                    ? "bg-brand-600 text-white border-brand-600" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-500 hover:text-brand-600"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 font-medium">
          Showing {filteredServices.length} results
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900">No professionals found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="mt-6 text-brand-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}