import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronRight, User } from "lucide-react";

async function getServicesBySubcategory(subcategoryId: string) {
    const subCategory = await prisma.category.findUnique({
        where: { id: subcategoryId },
        include: {
            parent: true,
            services: {
                include: {
                    user: { select: { name: true, shopName: true, image: true } },
                },
            },
        },
    });
    return subCategory;
}

// ✅ Fix: params is a Promise
export default async function ServiceListPage({
    params,
}: {
    params: Promise<{ categoryId: string; subcategoryId: string }>;
}) {
    // ✅ Fix: Await params here too
    const { categoryId, subcategoryId } = await params;

    const data = await getServicesBySubcategory(subcategoryId);

    if (!data) return <div className="p-10 text-center">Subcategory not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href="/servicescategory" className="hover:text-indigo-600">Categories</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <Link href={`/servicescategory/${categoryId}`} className="hover:text-indigo-600">
                        {data.parent?.name || "Back"}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-semibold text-gray-900">{data.name}</span>
                </nav>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">{data.name} Providers</h1>

                {/* Services List */}
                <div className="space-y-4">
                    {data.services.length > 0 ? (
                        data.services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow duration-300"
                            >
                                {/* Image */}
                                <div className="sm:w-64 h-48 sm:h-auto relative bg-gray-200 shrink-0">
                                    <img
                                        src={service.mainimg || service.coverImg || "/placeholder-service.jpg"}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                                        {service.priceType === "FIXED" ? `₹${service.price}` : `₹${service.price}/hr`}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{service.name}</h2>
                                            <div className="flex items-center bg-green-50 px-2 py-1 rounded text-green-700 text-sm font-bold border border-green-100">
                                                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                                                {service.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <p className="text-gray-500 mt-2 line-clamp-2 text-sm">{service.desc}</p>
                                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                                            <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-md">
                                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                {service.city || "On-site"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            {service.user.shopName || service.user.name}
                                        </span>
                                        <Link
                                            href={`/book-service/${service.id}`}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-900">No services found</h3>
                            <p className="text-gray-500 mt-1">There are currently no providers listed in {data.name}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}