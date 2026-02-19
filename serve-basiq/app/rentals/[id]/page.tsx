// app/rentals/[id]/page.tsx (or wherever your route is)
import RentalDetailsContent from '@/components/Rental/RentalDetailsContent';

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function RentalDetailsPage({ params }: Props) {
    // Resolve the params promise first (Next.js 15 requirement)
    const { id } = await params;

    // Render the extracted component
    return <RentalDetailsContent id={id} />;
}