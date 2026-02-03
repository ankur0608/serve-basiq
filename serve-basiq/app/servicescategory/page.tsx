import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryImage from "@/components/ui/CategoryImage"; // <--- Import the new component

// Optional: Prevent DB connection errors during build if your DB is busy
export const dynamic = 'force-dynamic'; 

async function getMainCategories() {
    return await prisma.category.findMany({
        where: {
            parentId: null,
            OR: [{ type: "SERVICE" }, { type: "BOTH" }],
        },
        orderBy: { name: "asc" },
    });
}

export default async function ServiceCategoriesPage() {
    const categories = await getMainCategories();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
                    <Link
                        href="/"
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-800" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                            Explore Services Categories
                        </h1>
                        <p className="text-xs text-gray-500">Choose a service to continue</p>
                    </div>
                </div>
            </header>

            {/* CATEGORY GRID */}
            <main className="max-w-7xl mx-auto px-4 pt-6 pb-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/servicescategory/${cat.id}`}
                            className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm
                                     text-center transition-all duration-300
                                     hover:shadow-md hover:-translate-y-1
                                     active:scale-[0.98] flex flex-col items-center justify-start h-full"
                        >
                            {/* Icon/Image Container */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl
                                          bg-gray-50 mb-3 overflow-hidden p-3
                                          group-hover:bg-blue-50 transition-colors">
                                
                                {/* ✅ Replaced the complex <img> logic with our Client Component */}
                                <CategoryImage src={cat.image} alt={cat.name} />
                                
                            </div>

                            {/* Category Label */}
                            <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-tight leading-tight transition-colors group-hover:text-blue-600">
                                {cat.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}