import Link from 'next/link';
import Image from 'next/image';
import { FaBoxOpen } from 'react-icons/fa6';

// Define the shape of the data based on your Prisma query
interface Category {
    id: string;
    name: string;
    image: string | null;
}

interface ProductCategoriesProps {
    categories: Category[];
}

export default function ProductCategories({ categories }: ProductCategoriesProps) {
    return (
        <div>
            <div className="flex justify-between items-end mb-6 px-1">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FaBoxOpen className="text-commerce-500" /> Wholesale Products
                </h2>
                <Link
                    href="/categories"
                    className="text-xs font-bold text-slate-500 hover:text-commerce-600 uppercase tracking-wide"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat) => (
                    <Link
                        href={`/products?category=${cat.name}`}
                        key={cat.id}
                        className="bg-white border border-gray-100 p-4 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group flex flex-col items-center justify-center h-32"
                    >
                        <div className="w-12 h-12 mb-3 relative group-hover:scale-110 transition flex items-center justify-center">
                            {cat.image ? (
                                /* Ensure your next.config.js allows the hostname of your images */
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                /* Fallback Icon if no image in DB */
                                <span className="text-3xl">📦</span>
                            )}
                        </div>
                        <div className="text-xs font-bold text-slate-700 line-clamp-2">
                            {cat.name}
                        </div>
                    </Link>
                ))}

                {/* Fallback if list is empty */}
                {categories.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 py-8">
                        No product categories found.
                    </div>
                )}
            </div>
        </div>
    );
}