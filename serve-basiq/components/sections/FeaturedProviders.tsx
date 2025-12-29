import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ServiceCard from '@/components/ui/ServiceCard';

export default async function FeaturedProviders() {
  // ✅ FIX: Explicitly tell TypeScript this is an array (using 'any[]' is the easiest fix here)
  let services: any[] = [];

  try {
    services = await prisma.service.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        categoryId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            name: true,
            img: true,
            isVerified: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    services = []; // Fallback to empty array on error
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trusted Experts</h2>
          <p className="text-gray-500 text-sm">Top rated professionals near you.</p>
        </div>
        <Link
          href="/services"
          className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
        >
          View All
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={{
                id: service.id,
                name: service.user?.name || "Service Provider",
                cat: service.categoryId || "General",
                price: Number(service.price) || 0,
                loc: service.city || "Location N/A",
                img: service.user?.img || "/default-avatar.png",
                rating: Number(service.rating) || 0,
                verified: service.user?.isVerified || false
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No professionals found yet.</p>
          <Link href="/provider/dashboard" className="text-blue-600 font-bold text-sm hover:underline">
            Be the first to join!
          </Link>
        </div>
      )}
    </section>
  );
}