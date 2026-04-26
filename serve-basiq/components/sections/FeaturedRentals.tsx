import Link from 'next/link';
import RentalCard from '@/components/ui/RentalCard';
import { FaArrowRight, FaGem } from 'react-icons/fa6';
import { getHomeFeaturedData } from '@/lib/data/home-feed';

export default async function FeaturedRentals() {
    // Calling the same function, but only extracting rentals. (It hits cache, not the DB again)
    const { rentals } = await getHomeFeaturedData();

    return (
        <section className="py-2">
            <div className="flex justify-between items-end mb-8 px-1">
                <div>
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <FaGem size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Premium Gear & Spaces</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Top Rentals</h2>
                </div>

                <Link href="/rentals" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">
                    View All 
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {rentals.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">                    {rentals.map((rental) => (
                    <div key={rental.id} className="h-full">
                        <RentalCard rental={rental as any} />
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-4xl border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                        <FaGem className="text-orange-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Rentals Found</h3>
                    <p className="text-slate-500 text-sm text-center max-w-sm mt-2">
                        We are currently adding top-rated rentals to your area. Please check back later!
                    </p>
                </div>
            )}
        </section>
    );
}