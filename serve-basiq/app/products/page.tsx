'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import clsx from 'clsx';

// ✅ Define Interface based on your DB Schema
interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  moq: string;
  img: string;
  supplier: string;
}

export default function B2BMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  // ✅ New State for Real Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Real Data from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products/all');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCat === 'All' || product.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  // ✅ Get Dynamic Categories from Real Data (instead of static file)
  const productCategories = Array.from(new Set(products.map(p => p.cat)));

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
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
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
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
            )}
          >
            All
          </button>

          {/* ✅ Map through Dynamic Categories */}
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm flex items-center gap-2",
                activeCat === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No products found matching your search.</p>
          <button onClick={() => { setSearchTerm(''); setActiveCat('All'); }} className="mt-4 text-blue-600 font-bold hover:underline">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}