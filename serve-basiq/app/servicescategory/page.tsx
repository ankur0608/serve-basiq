import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // Assuming you have lucide-react or similar icons

// Fetch data directly in Server Component for speed
async function getMainCategories() {
    return await prisma.category.findMany({
        where: {
            parentId: null, // Only top-level
            OR: [{ type: "SERVICE" }, { type: "BOTH" }],
        },
        orderBy: { name: "asc" },
    });
}

export default async function ServiceCategoriesPage() {
    const categories = await getMainCategories();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Explore Our Services
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Choose a category to find the perfect professional for your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/servicescategory/${cat.id}`}
                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            {/* Image Section */}
                            <div className="aspect-w-16 aspect-h-9 h-48 w-full bg-gray-200 overflow-hidden">
                                <img
                                    src={cat.image || "/placeholder-category.jpg"}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            </div>

                            {/* Content Section */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {cat.name}
                                </h3>
                                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    View Subcategories <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}