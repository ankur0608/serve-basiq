import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ui/ProductCard';

export default async function TrendingProducts() {
  let trendingProducts: any[] = [];

  try {
    const data = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      where: {
        // ✅ 1. Product must be verified
        isVerified: true,

        // ✅ 2. Seller must be verified
        user: {
          isVerified: true
        }
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    trendingProducts = data.map((product) => ({
      ...product,
      supplier: product.user?.name || "Verified Seller",
    }));

  } catch (error) {
    console.error("❌ Trending Products Error:", error);
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trending Wholesale</h2>
          <p className="text-gray-500 text-sm">Direct factory prices for bulk orders.</p>
        </div>
        <Link href="/products" className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
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
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No verified trending products found.</p>
        </div>
      )}
    </section>
  );
}