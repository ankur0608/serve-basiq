'use client'; // Needed for useRouter

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaTruck, FaArrowLeft } from 'react-icons/fa6'; // Added ArrowLeft

interface Category {
    id: string;
    name: string;
    image?: string | null;
}

interface RentalCategoriesProps {
    categories: Category[];
}

export default function RentalCategories({ categories }: RentalCategoriesProps) {
    const router = useRouter();

    // Take only the first 6 categories
    const displayCategories = categories.slice(0, 6);

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full transition shadow-sm active:scale-95"
                        aria-label="Go back"
                    >
                        <FaArrowLeft size={16} />
                    </button>

                    <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                        Popular Rentals
                    </h2>
                </div>

                <Link
                    href="/categories"
                    className="text-xs font-bold text-slate-500 hover:text-orange-600 uppercase tracking-wide"
                >
                    View All
                </Link>
            </div>

            {/* GRID CONFIGURATION:
          - grid-cols-4: Mobile (4 items in 1 row)
          - md:grid-cols-6: Desktop (6 items in 1 row)
          - gap-2: Tighter gap on mobile
      */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {displayCategories.length > 0 ? (
                    displayCategories.map((cat, index) => (
                        <Link
                            href={`/rentals?category=${cat.id}`}
                            key={cat.id}
                            // LOGIC:
                            // 1. "hidden md:flex": Hides the 5th & 6th item on mobile (index > 3)
                            // 2. "flex": Ensures items are visible otherwise
                            // 3. "h-24 md:h-32": Shorter height on mobile
                            className={`
                bg-white border border-gray-100 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group flex-col items-center justify-center
                p-2 md:p-4 
                h-24 md:h-32
                ${index > 3 ? 'hidden md:flex' : 'flex'}
              `}
                        >
                            {/* Image Container */}
                            <div className="w-full h-8 md:h-12 mb-2 relative group-hover:scale-110 transition flex items-center justify-center">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="object-contain max-h-full max-w-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-lg md:text-xl">
                                        <FaTruck />
                                    </div>
                                )}
                            </div>

                            {/* Category Name */}
                            <div className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide line-clamp-2 leading-tight">
                                {cat.name}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-400 text-sm py-8">
                        No rental categories found.
                    </div>
                )}
            </div>
        </div>
    );
}