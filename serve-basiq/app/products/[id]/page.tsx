// app/products/[id]/page.tsx
import ProductDetailContent from '@/components/products/ProductDetailContent';

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return <ProductDetailContent id={id} />;
}