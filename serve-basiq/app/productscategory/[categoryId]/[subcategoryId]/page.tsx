import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Truck, Check, ShoppingBag } from "lucide-react";

async function getProductsBySubcategory(subcategoryId: string) {
    const subCategory = await prisma.category.findUnique({
        where: { id: subcategoryId },
        include: {
            parent: true,
            products: {
                // Optional: Add 'where: { stockStatus: "IN_STOCK" }' if needed
                include: {
                    user: { select: { shopName: true, name: true } },
                },
            },
        },
    });
    return subCategory;
}

export default async function ProductListPage({
    params,
}: {
    params: Promise<{ categoryId: string; subcategoryId: string }>;
}) {
    const { categoryId, subcategoryId } = await params;

    const data = await getProductsBySubcategory(subcategoryId);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-xl text-gray-600">Subcategory not found</h1>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb - ✅ FIXED PATHS */}
                <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href="/productscategory" className="hover:text-blue-600 transition-colors">Marketplace</Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />

                    {/* Link back to Level 2 */}
                    <Link href={`/productscategory/${categoryId}`} className="hover:text-blue-600 transition-colors">
                        {data.parent?.name || "Category"}
                    </Link>

                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                    <span className="font-semibold text-gray-900">{data.name}</span>
                </nav>

                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {data.name} <span className="text-gray-400 font-normal text-lg">({data.products.length})</span>
                    </h1>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.products.length > 0 ? (
                        data.products.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* Product Image */}
                                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 relative overflow-hidden h-60">
                                    <img
                                        src={product.productImage || "/placeholder-product.jpg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.stockStatus === 'IN_STOCK' && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm">
                                            In Stock
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.user.shopName || product.user.name}</p>

                                        {/* Price Tag */}
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                            <span className="text-sm text-gray-500 font-medium">/ {product.unit.toLowerCase()}</span>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
                                        <div className="flex items-center text-xs text-gray-500">
                                            {product.deliveryType === 'DELIVERY' ? (
                                                <><Truck className="h-3 w-3 mr-1" /> Home Delivery</>
                                            ) : (
                                                <><Check className="h-3 w-3 mr-1" /> Pickup Only</>
                                            )}
                                        </div>

                                        <Link
                                            href={`/product/${product.id}`} // Ensure you have a single product page
                                            className="w-full flex items-center justify-center bg-gray-900 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            View Product
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-block p-4 rounded-full bg-gray-50 mb-4">
                                <ShoppingBag className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                            <p className="text-gray-500 mt-1">Check back later for new inventory in {data.name}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}