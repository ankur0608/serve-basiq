'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import clsx from 'clsx';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  supplier: string;
  images: string[];
}

const categories = [
  'All',
  'Safety',
  'Electrical',
  'Tools',
  'Machinery',
];

export default function B2BMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (activeCat !== 'All') params.append('cat', activeCat);

      const res = await fetch(`/api/b2b?${params.toString()}`);
      const data = await res.json();

      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Refetch on search / category change
  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300); // debounce
    return () => clearTimeout(delay);
  }, [searchTerm, activeCat]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Wholesale Marketplace
        </h1>
        <p className="text-slate-500">
          Direct factory prices for bulk orders.
        </p>
      </div>

      {/* Search */}
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

      {/* Categories */}
      <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={clsx(
                'px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm',
                activeCat === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-commerce-500 hover:text-commerce-600'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">
          Loading products...
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            No products found matching your search.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCat('All');
            }}
            className="mt-4 text-commerce-600 font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
