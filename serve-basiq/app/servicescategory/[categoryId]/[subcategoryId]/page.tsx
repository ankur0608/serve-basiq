import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import ServiceCard, { ServiceProps } from "@/components/ui/ServiceCard";

// Force dynamic to prevent build-time connection errors if DB is busy
export const dynamic = 'force-dynamic';

async function getServicesBySubCategory(subCatId: string) {
    // 1. Fetch Subcategory Info (for title/breadcrumbs)
    const subCategory = await prisma.category.findUnique({
        where: { id: subCatId },
        include: { parent: true }
    });

    if (!subCategory) return null;

    // 2. Fetch Services linked to this subcategory
    // utilizing the implicit many-to-many relation "ServiceSubcategories"
    const services = await prisma.service.findMany({
        where: {
            subcategories: {
                some: { id: subCatId }
            },
            isVerified: true, // Optional: Only show verified
        },
        include: {
            category: true, // Main category info
            user: {
                select: {
                    name: true,
                    image: true,
                    shopName: true,
                    isVerified: true
                }
            },
            reviews: {
                select: { rating: true }
            }
        }
    });

    return { subCategory, services };
}

export default async function ServiceListingPage({
    params,
}: {
    params: Promise<{ categoryId: string; subCategoryId: string }>;
}) {
    const { categoryId, subCategoryId } = await params;
    const data = await getServicesBySubCategory(subCategoryId);

    if (!data) return notFound();

    const { subCategory, services } = data;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
                    <Link
                        href={`/servicescategory/${categoryId}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900 leading-none">
                            {subCategory.name}
                        </h1>
                        <nav className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{subCategory.parent?.name || 'Category'}</span>
                            <ChevronRight className="w-3 h-3 mx-1" />
                            <span className="text-gray-800 font-medium">Services</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 pt-6">
                <div className="mb-6">
                    <p className="text-gray-500 text-sm">
                        Found <strong>{services.length}</strong> experts in {subCategory.name}
                    </p>
                </div>

                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => {
                            // Calculate Average Rating
                            const ratingSum = service.reviews.reduce((acc, rev) => acc + rev.rating, 0);
                            const avgRating = service.reviews.length > 0 
                                ? (ratingSum / service.reviews.length) 
                                : 5.0; // Default or 0

                            // Map to ServiceCard Props
                            const formattedService: ServiceProps = {
                                id: service.id,
                                name: service.name,
                                category: service.category?.name || subCategory.name,
                                price: Number(service.price),
                                priceType: service.priceType,
                                location: service.city || "Available Globally",
                                image: service.mainimg || service.serviceimg || "https://via.placeholder.com/400",
                                rating: parseFloat(avgRating.toFixed(1)),
                                reviewCount: service.reviews.length,
                                isVerified: service.isVerified,
                                providerName: service.user?.shopName || service.user?.name || "Pro User",
                                providerImage: service.user?.image,
                                user: service.user
                            };

                            // Note: We don't pass 'toggleFav' here since this is a Server Component.
                            // The card handles the UI gracefully.
                            return (
                                <ServiceCard 
                                    key={service.id} 
                                    service={formattedService} 
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ArrowLeft size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Services Found</h3>
                        <p className="text-gray-500 max-w-xs text-center mt-1">
                            There are currently no providers listed under {subCategory.name}.
                        </p>
                        <Link 
                            href={`/servicescategory/${categoryId}`}
                            className="mt-6 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                        >
                            Go Back
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}