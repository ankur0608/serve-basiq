'use client';

import { Suspense } from 'react';
import ProductsExplorer, { ProductsSkeleton } from '@/components/products/ProductsExplorer';

export default function B2BMarketplacePage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsExplorer />
    </Suspense>
  );
}