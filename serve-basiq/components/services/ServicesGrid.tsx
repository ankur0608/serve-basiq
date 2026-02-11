'use client';

import { SearchX } from 'lucide-react';
import ServiceCard from '@/components/ui/ServiceCard';
import { ExplorerSkeleton } from './ExplorerSkeleton';
import { ExplorerItem } from './explorer';

interface ServicesGridProps {
    items: ExplorerItem[];
    isLoading: boolean;
    favorites: string[];
    currentUser: any;
    onToggleFav: (e: React.MouseEvent, id: string, type: string) => void;
    onReset: () => void;
}

export default function ServicesGrid({ items, isLoading, favorites, currentUser, onToggleFav, onReset }: ServicesGridProps) {
    if (isLoading) return <ExplorerSkeleton />;

    return (
        <div className="container mx-auto max-w-7xl px-4 py-10">
            <div className="mb-6 flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">Available Services</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{items.length}</span>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="p-5 bg-slate-50 rounded-full mb-4">
                            <SearchX className="text-slate-400" size={48} />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-800">No services found</h4>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            We couldn't find any services matching your current filters. Try selecting a different category or location.
                        </p>
                        <button onClick={onReset} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl">
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <ServiceCard
                                key={item.id}
                                service={item}
                                isFav={favorites.includes(item.id)}
                                toggleFav={(e) => onToggleFav(e!, item.id, item.type)}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}