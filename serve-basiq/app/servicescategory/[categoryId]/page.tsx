import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, LayoutGrid } from "lucide-react";

async function getCategoryWithChildren(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            children: {
                orderBy: { name: "asc" },
            },
        },
    });
    return category;
}

// ✅ Fix: params is now a Promise<{ categoryId: string }>
export default async function SubCategoryPage({
    params,
}: {
    params: Promise<{ categoryId: string }>;
}) {
    // ✅ Fix: Await the params before using them
    const { categoryId } = await params;

    const parentCategory = await getCategoryWithChildren(categoryId);

    if (!parentCategory) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/servicescategory" className="hover:text-indigo-600">Categories</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-semibold text-gray-900">{parentCategory.name}</span>
                </nav>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {parentCategory.name}
                    </h1>
                    <p className="mt-2 text-gray-600">Select a subcategory to view services</p>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {parentCategory.children.length > 0 ? (
                        parentCategory.children.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/servicescategory/${parentCategory.id}/${sub.id}`}
                                className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-all text-center border border-gray-100 cursor-pointer"
                            >
                                <div className="h-16 w-16 mb-4 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden">
                                    {sub.image ? (
                                        <img src={sub.image} className="w-full h-full object-cover" alt={sub.name} />
                                    ) : (
                                        <LayoutGrid className="h-8 w-8 text-indigo-600" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900">{sub.name}</h3>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No subcategories found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}