'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass, FaArrowLeft } from 'react-icons/fa6';
import { PackageOpen, ImageOff } from 'lucide-react';
import { BiMap } from "react-icons/bi";

export default function B2BMarketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("🔄 Fetching Market Data...");

        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products/all?limit=50', { cache: 'no-store' }), // Fresh Products
          fetch('/api/categories?type=PRODUCT', { cache: 'no-store' }) // ✅ FIX: Force Fresh Categories
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        console.log("📦 Products API Response:", prodData);
        console.log("📂 Categories API Response:", catData);

        // 1. Process Products
        if (prodData.success && Array.isArray(prodData.products)) {
          const formattedProducts = prodData.products.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: typeof item.category === 'string' ? item.category : item.category?.name || "General",
            price: Number(item.price) || 0,
            moq: Number(item.moq) || 1,
            unit: item.unit || "Pcs",
            // Image mapping priority
            image: item.productImage || item.img || item.gallery?.[0] || "",
            supplier: item.supplier || item.user?.shopName || "Verified Seller",
            isVerified: item.isVerified || false
          }));
          setProducts(formattedProducts);
        }

        // 2. Process Categories (Handle Array vs Object wrapper)
        if (Array.isArray(catData)) {
            setCategories(catData);
        } else if (catData.categories && Array.isArray(catData.categories)) {
            // Fallback if API returns { categories: [...] }
            setCategories(catData.categories);
        } else {
            console.warn("⚠️ Categories data format unexpected:", catData);
        }

      } catch (error) {
        console.error("❌ Failed to load marketplace data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to filter page (ensure you have this page or change logic)
    router.push(`/products?cat=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-600 transition-colors -ml-2"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wholesale Market</h1>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 pl-3 pr-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
              <BiMap className="text-blue-600 text-lg" /> <span>Global</span>
            </div>
          </div>

          <div className="relative w-full max-w-xl group">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100/80 border-0 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium"
            />
          </div>

          <div className="hidden md:block">
            <span className="bg-green-100 text-green-700 text-xs font-extrabold px-3 py-1.5 rounded-full tracking-wide">B2B ONLY</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">

        {/* --- CATEGORIES --- */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
            Shop by Category
            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all group h-32"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden mb-2 bg-slate-50 border border-slate-100 group-hover:border-blue-200 relative">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-2 uppercase tracking-wide group-hover:text-blue-700">
                    {cat.name}
                  </span>
                </button>
              ))
            ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                    No Product Categories Found.
                </div>
            )}
          </div>
        </div>

        {/* --- PRODUCTS --- */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            ⚡ Trending Deals
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <PackageOpen className="text-gray-400 mx-auto mb-4" size={32} />
              <p className="text-gray-900 font-bold">No products found</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}