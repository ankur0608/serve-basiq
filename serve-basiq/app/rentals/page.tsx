'use client';

import { Suspense } from 'react';
import RentalsExplorer from '@/components/Rental/RentalsExplorer';

export default function RentalsPage() {
  const showToast = (message: string, type: string) => {
    console.log(`${type}: ${message}`);
  };

  return (
    <Suspense fallback={<div className="p-4">Loading rentals...</div>}>
      <RentalsExplorer showToast={showToast} providerType="rental" />
    </Suspense>
  );
}