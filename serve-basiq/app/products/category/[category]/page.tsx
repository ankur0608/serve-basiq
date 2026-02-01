'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { FaArrowLeft } from 'react-icons/fa6';
import { PackageOpen, Loader2 } from 'lucide-react';

export default function ProductCategoryPage() {
    const params = useParams();
    const router = useRouter();

    // Decode URL safe string back to normal text (e.g. "Raw%20Material" -> "Raw Material")
    const categoryName = params.category ? decodeURIComponent(params.category as string) : "";

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (!categoryName) return;

            setLoading(true);
            try {
                // Fetch products using the filtered API
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

        fetchCategoryProducts();
    }, [categoryName]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">

            {/* --- Header --- */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 text-slate-600 transition-colors -ml-2 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{categoryName}</h1>
                        {!loading && (
                            <p className="text-xs font-bold text-slate-500">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-slate-400 font-medium text-sm">Loading products...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    // --- Empty State ---
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <PackageOpen className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                            We currently don't have any products listed under <strong>{categoryName}</strong>.
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="mt-6 text-white bg-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-slate-200"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}