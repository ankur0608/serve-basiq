import Link from 'next/link';
import { services } from '@/lib/data';
import ServiceCard from '@/components/ui/ServiceCard';

export default function FeaturedProviders() {
  // Take first 3 services for the home page display
  const featuredServices = services.slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trusted Experts</h2>
          <p className="text-gray-500 text-sm">Top rated professionals near you.</p>
        </div>
        <Link 
          href="/services" 
          className="text-brand-600 font-bold text-sm bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition"
        >
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-featured-providers">
        {featuredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}