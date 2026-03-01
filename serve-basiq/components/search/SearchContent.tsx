// app/search/page.tsx
"use client";

import { useState } from 'react'; // Added useState
import { useSearchParams } from 'next/navigation';
import { useGlobalSearch } from '@/app/hook/useGlobalSearch';
import { useUIStore } from '@/lib/store';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// Import your actual card components
import ServiceCard from '@/components/ui/ServiceCard';
import ProductCard from '@/components/ui/ProductCard';
import RentalCard from '@/components/ui/RentalCard';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    // Fetch the search data
    const { data, isLoading, isError } = useGlobalSearch(query);

    // Fetch current user to pass to the cards (for booking/quoting features)
    const currentUser = useUIStore((state) => state.currentUser);

    // Tab state
    const [activeTab, setActiveTab] = useState<'All' | 'Services' | 'Products' | 'Rentals'>('All');

    const hasResults = data && (data.services.length > 0 || data.products.length > 0 || data.rentals.length > 0);

    return (
        <>
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black">Search Results</h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Showing results for <span className="text-slate-900 font-bold">"{query}"</span>
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-slate-500 font-medium">Searching across ServeBasiq...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-red-500 font-bold">Oops! Something went wrong while searching.</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FaMagnifyingGlass className="text-slate-300 text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No results found</h2>
                        <p className="text-slate-500 max-w-sm text-center">
                            We couldn't find anything matching "{query}". Try adjusting your search or checking for typos.
                        </p>
                        <Link href="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                            Back to Home
                        </Link>
                    </div>
                )}

                {/* Results State */}
                {!isLoading && hasResults && data && (
                    <div className="w-full">

                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('All')}
                                className={`pb-3 px-4 font-bold border-b-2 transition-colors ${activeTab === 'All' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                All Results
                            </button>

                            {data.services.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('Services')}
                                    className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Services' ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    Services <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{data.services.length}</span>
                                </button>
                            )}

                            {data.products.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('Products')}
                                    className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Products' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    Products <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{data.products.length}</span>
                                </button>
                            )}

                            {data.rentals.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('Rentals')}
                                    className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Rentals' ? 'border-orange-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    Rentals <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{data.rentals.length}</span>
                                </button>
                            )}
                        </div>

                        {/* Tab Content Area */}
                        <div className="space-y-16">

                            {/* Services Results */}
                            {(activeTab === 'All' || activeTab === 'Services') && data.services.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                            Services
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                        {data.services.map(service => (
                                            <ServiceCard
                                                key={service.id}
                                                service={{
                                                    id: service.id,
                                                    name: service.name,
                                                    image: service.mainimg || service.serviceimg || '',
                                                    location: service.city || 'Remote',
                                                    rating: service.rating || 0,
                                                    price: service.price,
                                                    priceType: service.priceType,
                                                    type: 'Service',
                                                    categoryName: 'Service'
                                                }}
                                                currentUser={currentUser}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Products Results */}
                            {(activeTab === 'All' || activeTab === 'Products') && data.products.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                            Products
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                        {data.products.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                currentUser={currentUser}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Rentals Results */}
                            {(activeTab === 'All' || activeTab === 'Rentals') && data.rentals.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                            Rentals
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                        {data.rentals.map(rental => (
                                            <RentalCard
                                                key={rental.id}
                                                rental={{
                                                    id: rental.id,
                                                    name: rental.name,
                                                    image: rental.rentalImg || '',
                                                    location: rental.city || 'Remote',
                                                    rating: 0,
                                                    price: rental.price,
                                                    priceType: rental.priceType,
                                                    categoryName: 'Rental'
                                                }}
                                                currentUser={currentUser}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SearchContent;