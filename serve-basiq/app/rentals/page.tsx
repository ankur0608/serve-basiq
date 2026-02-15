'use client';

import { Suspense } from 'react';
import RentalsExplorer from '@/components/Rental/RentalsExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';

export default function RentalsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <RentalsExplorer />
    </Suspense>
  );
}