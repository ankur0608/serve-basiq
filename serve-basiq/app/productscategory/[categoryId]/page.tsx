import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, LayoutGrid } from "lucide-react";

async function getProductCategoryWithChildren(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            children: {
                orderBy: { name: "asc" },
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            },
        },
    });
    return category;
}

export default async function ProductSubCategoryPage({
    params,
}: {
    params: Promise<{ categoryId: string }>;
}) {
    const { categoryId } = await params;
    const parentCategory = await getProductCategoryWithChildren(categoryId);

    if (!parentCategory) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb - ✅ FIXED PATH */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/productscategory" className="hover:text-blue-600 transition-colors">Marketplace</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-semibold text-gray-900">{parentCategory.name}</span>
                </nav>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {parentCategory.name}
                    </h1>
                    <p className="mt-2 text-gray-600">Explore categories within {parentCategory.name}</p>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {parentCategory.children.length > 0 ? (
                        parentCategory.children.map((sub) => (
                            <Link
                                key={sub.id}
                                // ✅ FIXED PATH: /productscategory/...
                                href={`/productscategory/${parentCategory.id}/${sub.id}`}
                                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-0">
                                    <div className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-bl-lg">
                                        {sub._count.products} Items
                                    </div>
                                </div>

                                <div className="h-20 w-20 mb-4 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors overflow-hidden">
                                    {sub.image ? (
                                        <img src={sub.image} className="w-full h-full object-cover" alt={sub.name} />
                                    ) : (
                                        <Package className="h-8 w-8 text-blue-600" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {sub.name}
                                </h3>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <LayoutGrid className="h-12 w-12 text-gray-300 mb-2" />
                            <p>No subcategories found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}