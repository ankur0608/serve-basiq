'use client';

import { Suspense } from 'react';
import RentalsExplorer from '@/components/Rental/RentalsExplorer';

export default function RentalsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading rentals...</div>}>
      <RentalsExplorer  />
    </Suspense>
  );
}