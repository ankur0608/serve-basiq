import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // ✅ Import Prisma
import ServiceCard from '@/components/ui/ServiceCard';

export default async function FeaturedProviders() {

  // 1. Fetch real data from Neon Database
  // We take the top 3 services, ordered by newest first (or you can use rating: 'desc')
  const featuredServices = await prisma.service.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

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

      {/* 2. Render Real Data */}
      {featuredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-featured-providers">
          {featuredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        // Fallback if no data exists yet
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No professionals found yet.</p>
          <Link href="/services/new" className="text-blue-600 font-bold text-sm hover:underline">
            Become the first Pro!
          </Link>
        </div>
      )}
    </section>
  );
}