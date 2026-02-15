'use client';

import { Suspense } from 'react';
import ProductsExplorer from '@/components/products/ProductsExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';

export default function B2BMarketplacePage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsExplorer />
    </Suspense>
  );
}