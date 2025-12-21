import Link from 'next/link';
import { products } from '@/lib/data';
import ProductCard from '@/components/ui/ProductCard';

export default function TrendingProducts() {
  // Take first 4 products for the home page display
  const trendingProducts = products.slice(0, 4);

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trending Wholesale</h2>
          <p className="text-gray-500 text-sm">Direct factory prices for bulk orders.</p>
        </div>
        <Link 
          href="/b2b" 
          className="text-commerce-600 font-bold text-sm bg-commerce-50 px-3 py-1.5 rounded-lg hover:bg-commerce-100 transition"
        >
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="home-top-products">
        {trendingProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}