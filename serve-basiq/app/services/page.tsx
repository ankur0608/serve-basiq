// app/services/page.tsx
import ServicesExplorer from '@/components/services/ServicesExplorer';

export const metadata = {
  title: 'Explore Services | ServeMate',
  description: 'Find top-rated professionals for home, beauty, and repair services near you.',
};

export default function Page() {
  return <ServicesExplorer />;
}