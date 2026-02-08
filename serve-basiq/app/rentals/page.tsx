'use client';

import { Suspense } from 'react';
import RentalsExplorer, { RentalSkeleton } from '@/components/Rental/RentalsExplorer';

export default function RentalsPage() {
  return (
    <Suspense fallback={<RentalSkeleton />}>
      <RentalsExplorer />
    </Suspense>
  );
}