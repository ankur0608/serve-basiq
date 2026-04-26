'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaScrewdriverWrench, FaArrowLeft } from 'react-icons/fa6';

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

interface CategoryProps {
  categories: Category[];
}

export default function ServiceCategories({ categories }: CategoryProps) {
  const router = useRouter();
  const displayCategories = categories.slice(0, 6);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full transition shadow-sm active:scale-95"
            aria-label="Go back"
          >
            <FaArrowLeft size={16} />
          </button>

          <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
            Popular Services
          </h2>
        </div>

        <Link
          href="/categories?tab=SERVICE" // ✅ ADDED TAB PARAMETER
          className="text-xs font-bold text-slate-500 hover:text-brand-600 uppercase tracking-wide"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {displayCategories.length > 0 ? (
          displayCategories.map((cat, index) => (
            <Link
              href={`/categories?categoryId=${cat.id}`}
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
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="object-contain max-h-full max-w-full"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg md:text-xl">
                    <FaScrewdriverWrench />
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
            No service categories found.
          </div>
        )}
      </div>
    </div>
  );
}