import { Suspense } from 'react';
import ServicesExplorer, { ExplorerSkeleton } from '@/components/services/ServicesExplorer';

export const metadata = {
  title: 'Explore Services | Servebasiq',
  description: 'Find top-rated professionals for home, beauty, and repair services near you.',
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <ServicesExplorer />
    </Suspense>
  );
}