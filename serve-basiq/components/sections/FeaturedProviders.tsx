import Link from 'next/link';
import ServiceCard from '@/components/ui/ServiceCard';
import { FaArrowRight, FaShieldHalved } from 'react-icons/fa6';
import { getHomeFeaturedData } from '@/lib/data/home-feed';

export default async function FeaturedProviders() {
  // Call the central function. Next.js instantly provides the services data.
  const { services } = await getHomeFeaturedData();

  return (
    <section className="py-2">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FaShieldHalved size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Verified Professionals</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Trusted Experts</h2>
        </div>

        <Link href="/services" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
          View All 
          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service as any} />
          ))}
        </div>
      ) : (
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