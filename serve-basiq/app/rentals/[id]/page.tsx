import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RentalDetailPage({ params }: PageProps) {
    // 1. Await params (Required for Next.js 15)
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // 2. Fetch Rental Data
    const rental = await prisma.rental.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true, name: true, image: true, profileImage: true,
                    phone: true, shopName: true, isVerified: true,
                    instagramUrl: true, facebookUrl: true, youtubeUrl: true, websiteUrl: true,
                }
            },
            category: { select: { name: true } },
            subcategory: { select: { id: true, name: true } },
        }
    });

    if (!rental) notFound();

    // 3. Fetch Logged-in User for addresses
    let loggedInUser = null;
    if (session?.user?.id) {
        loggedInUser = await prisma.user.findUnique({
            where: { id: session.user.id as string },
            include: { addresses: true }
        });
    }

    // 4. ✅ DATA NORMALIZATION (Fixes the "map" error and "missing image" issue)
    const formattedRental: any = {
        ...rental,
        rating: 5.0,
        reviews: [],
        // Force rentalImg to map to keys the Detail View looks for
        mainimg: rental.rentalImg,
        serviceimg: rental.rentalImg,
        coverImg: rental.coverImg || rental.rentalImg,
        // Ensure lists exist as arrays to prevent .map() undefined errors
        gallery: rental.gallery || [],
        workingDays: [], // Rentals don't have this field in your DB
    };

    return (
        <ServiceDetailView
            service={formattedRental}
            loggedInUser={loggedInUser}
            session={session}
        />
    );
}