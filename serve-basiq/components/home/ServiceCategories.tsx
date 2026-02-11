import Link from 'next/link';
import Image from 'next/image';
import { FaScrewdriverWrench } from 'react-icons/fa6';

interface Category {
  id: string;
  name: string;
  image: string | null;
}

interface CategoryProps {
  categories: Category[];
}

export default function ServiceCategories({ categories }: CategoryProps) {
  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6 px-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FaScrewdriverWrench className="text-brand-500" /> Popular Services
        </h2>
        <Link
          href="/categories"
          className="text-xs font-bold text-slate-500 hover:text-brand-600 uppercase tracking-wide"
        >
          View All
        </Link>
      </div>

      {/* Grid Section: Changed to grid-cols-3 to match ProductCategories (3 per row) */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link
              href={`/services/category/${cat.id}`}
              key={cat.id}
              className="bg-white border border-gray-100 p-4 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group flex flex-col items-center justify-center h-32"
            >
              {/* Image Container */}
              <div className="w-24 h-12 mb-3 relative group-hover:scale-110 transition flex items-center justify-center">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    // fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  // Styled Fallback Icon (Blue/Brand theme for Services)
                  <div className="w-full h-full bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                    <FaScrewdriverWrench />
                  </div>
                )}
              </div>

              {/* Category Name */}
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide line-clamp-2">
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