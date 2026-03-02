import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ServiceCard, { ServiceProps } from '@/components/ui/ServiceCard'; // Ensure this path matches your file structure
import { FaArrowRight, FaShieldHalved } from 'react-icons/fa6';

export default async function FeaturedProviders() {
  let services: any[] = [];

  try {
    services = await prisma.service.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      where: {
        isVerified: true,
        user: {
          isVerified: true
        }
      },
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        user: {
          select: {
            name: true,
            image: true,
            isVerified: true, 
            shopName: true,
            profileImage: true
          }
        }
      }
    });

    console.log("✅ Featured Providers Found:", services.length);
  } catch (error) {
    console.error("❌ Featured Providers Error:", error);
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

      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const mainImage =
              service.coverImg ||
              service.serviceimg ||
              service.mainimg ||
              (service.gallery && service.gallery.length > 0 ? service.gallery[0] : null) ||
              service.user?.image ||
              service.user?.profileImage ||
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80";

            const formattedService: ServiceProps = {
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

            return <ServiceCard key={formattedService.id} service={formattedService} />;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FaShieldHalved className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Experts Found</h3>
          <p className="text-slate-500 text-sm text-center max-w-xs mt-1">
            Tip: Ensure both the <b>User</b> and the <b>Service</b> have <b>isVerified: true</b> in the database.
          </p>
        </div>
      )}
    </section>
  );
}