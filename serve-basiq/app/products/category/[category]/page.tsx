'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { FaArrowLeft } from 'react-icons/fa6';
import { PackageOpen } from 'lucide-react';

export default function ProductCategoryPage() {
    const params = useParams();
    const router = useRouter();

    // Decode the category name from URL (e.g. "Tools%20%26%20Hardware" -> "Tools & Hardware")
    const categoryName = decodeURIComponent(params.category as string);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            setLoading(true);
            try {
                // ✅ Fetch products filtered by this category
                const res = await fetch(`/api/products/all?cat=${encodeURIComponent(categoryName)}`, {
                    cache: 'no-store'
                });
                const data = await res.json();

                if (data.success && Array.isArray(data.products)) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Error fetching category products", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) fetchCategoryProducts();
    }, [categoryName]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm font-bold">
                        <FaArrowLeft /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">{categoryName}</h1>
                        <p className="text-sm text-gray-500">{products.length} products available</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <PackageOpen className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            We currently don't have any products listed in the <strong>{categoryName}</strong> category.
                        </p>
                        <button onClick={() => router.back()} className="mt-6 text-blue-600 font-bold hover:underline">
                            Go Back to Market
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}