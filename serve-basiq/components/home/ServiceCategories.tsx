import Link from 'next/link';
import { FaScrewdriverWrench } from 'react-icons/fa6';

// Move Style Map here (Presentation Logic)
const STYLE_MAP: Record<string, { emoji: string; color: string }> = {
  cleaning: { emoji: "🧹", color: "blue" },
  repair: { emoji: "🛠️", color: "orange" },
  plumbing: { emoji: "💧", color: "cyan" },
  electrical: { emoji: "⚡", color: "yellow" },
  beauty: { emoji: "💅", color: "pink" },
  painting: { emoji: "🎨", color: "purple" },
  moving: { emoji: "📦", color: "indigo" },
  default: { emoji: "📌", color: "gray" }
};

interface CategoryProps {
  categories: { id: string; name: string }[];
}

export default function ServiceCategories({ categories }: CategoryProps) {
  return (
    <div>
      <div className="flex justify-between items-end mb-6 px-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FaScrewdriverWrench className="text-brand-500" /> Popular Services
        </h2>
        <Link href="/services" className="text-xs font-bold text-slate-500 hover:text-brand-600 uppercase tracking-wide">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.length > 0 ? (
          categories.map((cat) => {
            // Apply Styling Map
            const style = STYLE_MAP[cat.id] || STYLE_MAP.default;

            return (
              <Link
                href={`/services/category/${cat.id}`}
                key={cat.id}
                className="bg-white border border-gray-100 p-4 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group"
              >
                <div className={`text-3xl mb-2 group-hover:scale-110 transition w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-${style.color}-50 text-${style.color}-600`}>
                  {style.emoji}
                </div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{cat.name}</div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-400 text-sm py-4">No categories found.</div>
        )}
      </div>
    </div>
  );
}