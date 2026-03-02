import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ui/ProductCard';

// Optional: Add caching if this is rendered on a dynamic page
// export const revalidate = 3600; // Revalidate every hour

// Define the expected type based on your Prisma schema
type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  supplier: string;
  // Add other fields that ProductCard requires here
};

export default async function TrendingProducts() {
  let trendingProducts: TrendingProduct[] = [];

  try {
    const data = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' }, // In the future, change to { salesCount: 'desc' } or similar
      where: {
        isVerified: true,
        user: {
          isVerified: true
        }
      },
      // Explicitly select only what is needed for the ProductCard to save bandwidth
      select: {
        id: true,
        name: true,
        price: true,
        productImage: true,
        gallery: true,
        category: {
          select: { name: true }
        },
        user: {
          select: { name: true, shopName: true }
        }
      }
    });

    // Safely map data with fallbacks
    trendingProducts = data.map((product) => ({
      ...product,
      image: product.productImage || (product.gallery?.[0]) || "/placeholder-product.webp",
      category: product.category?.name || "General",
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
    }));

  } catch (error) {
    // In production, send this to an APM tool like Sentry or Datadog
    console.error("[TrendingProducts] Failed to fetch products:", error);
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trending Wholesale</h2>
          <p className="text-gray-500 text-sm">Direct factory prices for bulk orders.</p>
        </div>
        <Link
          href="/products"
          className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition active:scale-95"
        >
          View All
        </Link>
      </div>

      {trendingProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="home-top-products">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // User-friendly empty state
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <span className="text-slate-300 text-xl">📦</span>
          </div>
          <h3 className="text-sm font-bold text-slate-700">Check back soon!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            We are currently curating the best wholesale products for you.
          </p>
        </div>
      )}
    </section>
  );
}