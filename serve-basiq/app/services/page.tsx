import { Suspense } from 'react';
import ServicesExplorer from '@/components/services/ServicesExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';

export const metadata = {
  title: 'Explore Services | Servebasiq',
  description: 'Find top-rated professionals for home, beauty, and repair services near you.',
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ServicesExplorer />
    </Suspense>
  );
}