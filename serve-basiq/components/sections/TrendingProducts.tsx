  import Link from 'next/link';
  import ProductCard from '@/components/ui/ProductCard';
  import { getHomeFeaturedData } from '@/lib/data/home-feed';

  export default async function TrendingProducts() {
    const { products } = await getHomeFeaturedData();

    return (
      <section>
        <div className="flex justify-between items-center mb-6 px-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Trending Wholesale</h2>
            <p className="text-gray-500 text-sm">Direct factory prices for bulk orders.</p>
          </div>
          <Link href="/products" className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition active:scale-95">
            View All
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid  grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="home-top-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
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