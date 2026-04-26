'use client';

import Link from 'next/link';
import { FaBoxOpen } from 'react-icons/fa6';
import AppImage from '@/components/ui/AppImage';

interface Category {
    id: string;
    name: string;
    image?: string | null;
}

interface ProductCategoriesProps {
    categories: Category[];
}

export default function HomeProductCategories({ categories }: ProductCategoriesProps) {
    const displayCategories = categories.slice(0, 6);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                        Wholesale Products
                    </h2>
                </div>

                <Link
                    href="/categories?tab=PRODUCT"
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wide"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {displayCategories.length > 0 ? (
                    displayCategories.map((cat, index) => (
                        <Link
                            href={`/products?category=${cat.id}`}
                            key={cat.id}
                            className={`
                                bg-white border border-gray-100 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group flex-col items-center justify-center
                                p-2 md:p-4 
                                h-24 md:h-32
                                ${index > 3 ? 'hidden md:flex' : 'flex'}
                            `}
                        >
                            <div className="w-full h-8 md:h-12 mb-2 relative group-hover:scale-110 transition flex items-center justify-center">
                                {cat.image ? (
                                    <AppImage
                                        src={cat.image}
                                        alt={cat.name}
                                        type="icon"
                                        imageClassName="object-contain"
                                        className="w-full h-full"
                                        sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 10vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg md:text-xl">
                                        <FaBoxOpen />
                                    </div>
                                )}
                            </div>

                            <div className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide line-clamp-2 leading-tight">
                                {cat.name}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-400 text-sm py-8">
                        No product categories found.
                    </div>
                )}
            </div>
        </div>
    );
}