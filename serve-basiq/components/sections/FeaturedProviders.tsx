import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard';
import { FaArrowRight, FaShieldHalved } from 'react-icons/fa6';

// Optional: Add caching if this is rendered on a dynamic page
// export const revalidate = 3600; // Revalidate every hour

export default async function FeaturedProviders() {
  let formattedServices: ServiceProps[] = [];

  try {
    const services = await prisma.service.findMany({
      take: 4,
      orderBy: { rating: 'desc' }, // Usually better to order featured by rating or reviews rather than createdAt
      where: {
        isVerified: true,
        user: {
          isVerified: true
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        priceType: true,
        city: true,
        state: true,
        loc: true,
        coverImg: true,
        serviceimg: true,
        mainimg: true,
        gallery: true,
        rating: true,
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        user: {
          select: {
            name: true,
            image: true,
            profileImage: true,
            shopName: true
          }
        }
      }
    });

    formattedServices = services.map((service) => {
      // Safely extract the best available image
      const mainImage =
        service.coverImg ||
        service.serviceimg ||
        service.mainimg ||
        service.gallery?.[0] ||
        service.user?.profileImage ||
        service.user?.image ||
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80";

      return {
        id: service.id,
        name: service.name,
        categoryName: service.category?.name || "General Service",
        subcategoryName: service.subcategory?.name,
        price: Number(service.price) || 0,
        priceType: service.priceType || 'FIXED',
        location: service.city
          ? `${service.city}${service.state ? `, ${service.state}` : ''}`
          : (service.loc || "India"),
        image: mainImage,
        rating: Number(service.rating) || 5.0,
        type: 'Service'
      };
    });

  } catch (error) {
    // In production, send this to an APM tool like Sentry or Datadog
    console.error("[FeaturedProviders] Failed to fetch providers:", error);
  }

  return (
    <section className="py-8">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FaShieldHalved size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Verified Professionals</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Trusted Experts</h2>
        </div>

        <Link
          href="/services"
          className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          View All Providers
          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {formattedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formattedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        // User-friendly empty state
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FaShieldHalved className="text-blue-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Experts Found</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm mt-2">
            We are currently onboarding top-rated professionals to your area. Please check back later!
          </p>
        </div>
      )}
    </section>
  );
}