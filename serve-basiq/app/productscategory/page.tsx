import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

async function getMainProductCategories() {
    return await prisma.category.findMany({
        where: {
            parentId: null,
            OR: [{ type: "PRODUCT" }, { type: "BOTH" }],
        },
        orderBy: { name: "asc" },
    });
}

export default async function ProductCategoriesPage() {
    const categories = await getMainProductCategories();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                        <ShoppingBag className="h-6 w-6" />
                    </span>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Marketplace
                    </h1>
                    <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                        Browse our wide range of products. Select a category to start shopping.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            // ✅ FIXED PATH: /productscategory/...
                            href={`/productscategory/${cat.id}`}
                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                        >
                            {/* Image Container */}
                            <div className="aspect-w-4 aspect-h-3 h-64 w-full bg-gray-100 relative overflow-hidden">
                                <img
                                    src={cat.image || "/placeholder-product-cat.jpg"}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                {/* Text overlay */}
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {cat.name}
                                    </h3>
                                    <div className="flex items-center text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform">
                                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}