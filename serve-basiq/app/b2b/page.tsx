'use client';

import { useState } from 'react';
import Link from 'next/link';
import { products, categories } from '@/lib/data';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import clsx from 'clsx';

export default function B2BMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCat === 'All' || product.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  const b2bCategories = categories.filter(c => c.type === 'product');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Wholesale Marketplace</h1>
        <p className="text-slate-500">Direct factory prices for bulk orders.</p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8 max-w-2xl">
        <FaMagnifyingGlass className="absolute left-4 top-3.5 text-gray-400 text-lg" />
        <input 
          type="text" 
          placeholder="Search machines, tools, bulk items..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-commerce-500 outline-none shadow-sm transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveCat('All')}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm",
              activeCat === 'All' 
                ? "bg-slate-900 text-white" 
                : "bg-white border border-gray-200 text-gray-600 hover:border-commerce-500 hover:text-commerce-600"
            )}
          >
            All
          </button>
          {b2bCategories.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => setActiveCat(cat.name)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm flex items-center gap-2",
                activeCat === cat.name
                  ? "bg-commerce-600 text-white" 
                  : "bg-white border border-gray-200 text-gray-600 hover:border-commerce-500 hover:text-commerce-600"
              )}
            >
              {/* Note: You can map icons here if you import them dynamically or create an icon map */}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No products found matching your search.</p>
          <button onClick={() => { setSearchTerm(''); setActiveCat('All'); }} className="mt-4 text-commerce-600 font-bold hover:underline">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}