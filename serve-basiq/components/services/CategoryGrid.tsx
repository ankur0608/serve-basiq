'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { FaCheck } from 'react-icons/fa6';
import { CategoryData } from './explorer';

interface CategoryGridProps {
    categories: CategoryData[];
    selectedCategory: string;
    onSelect: (id: string) => void;
    onReset: () => void;
}

export default function CategoryGrid({
    categories = [],
    selectedCategory,
    onSelect,
    onReset
}: CategoryGridProps) {
    return (
        <div className="container mx-auto max-w-7xl px-4 mt-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
                        Browse Categories
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Find the expert you need</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                >
                    View All
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {categories?.length > 0 ? (categories.slice(0, 12).map((cat) => {
                    const isSelected = String(selectedCategory) === String(cat.id);
                    return (
                        <div
                            onClick={() => onSelect(cat.id)}
                            key={cat.id}
                            className={`
                                    relative h-48 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300
                                    ${isSelected ? 'ring-4 ring-slate-900 ring-offset-2' : 'hover:shadow-xl hover:-translate-y-1'}
                                `}
                        >
                            <Image
                                src={cat.image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80"}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity ${isSelected ? 'opacity-90' : 'opacity-70 group-hover:opacity-80'}`} />
                            <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end h-full">
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{cat.name}</h3>
                                    <p className="text-slate-300 text-xs mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        {cat.children?.length || 0} Subcategories
                                    </p>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-3 right-3 bg-white text-slate-900 rounded-full p-1.5 shadow-sm animate-in zoom-in">
                                    <FaCheck size={12} strokeWidth={20} />
                                </div>
                            )}
                        </div>
                    );
                })
                ) : (
                    <div className="col-span-full py-8 text-center text-slate-400">Loading categories...</div>
                )}
            </div>
        </div>
    );
}