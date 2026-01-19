import React from 'react';
import { ChevronRight } from 'lucide-react';

// Define the shape of a single item
interface CategoryItem {
  id: string | number;
  label: string;
  icon: React.ReactNode; // You can pass an <img/> or an Icon component here
}

interface CategorySectionProps {
  title: string;
  items: CategoryItem[];
  onViewAll?: () => void;
  onItemClick?: (item: CategoryItem) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  items,
  onViewAll,
  onItemClick,
}) => {
  return (
    <section className="w-full py-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          {/* Optional: You can add a decorative icon next to title if needed */}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <button 
          onClick={onViewAll}
          className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
        >
          VIEW ALL
        </button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onItemClick && onItemClick(item)}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 h-28"
          >
            <div className="mb-3 text-blue-500 text-3xl">
              {/* This renders the icon passed in props */}
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;