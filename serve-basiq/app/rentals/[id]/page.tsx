import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import RentalDetailsContent from '@/components/Rental/RentalDetailsContent';

interface Props {
    params: Promise<{ id: string }>;
}

// 🚀 1. Cache the database queries
const getCachedRentalData = unstable_cache(
    async (id: string) => {
        const rawRental = await prisma.rental.findUnique({
            where: { id },
            include: {
                category: { select: { name: true } },
                subcategory: { select: { name: true } },
                reviews: {
                    include: { author: { select: { name: true, image: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10 // Limit reviews for initial load performance
                },
                user: {
                    select: {
                        id: true, name: true, shopName: true, email: true, phone: true,
                        isVerified: true, image: true, profileImage: true,
                        instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true,
                        addresses: true
                    }
                }
            }
        });

        if (!rawRental) return null;

        const rawRelatedRentals = await prisma.rental.findMany({
            where: { categoryId: rawRental.categoryId, id: { not: id } },
            take: 8,
            select: {
                id: true, name: true, price: true, priceType: true,
                coverImg: true, rentalImg: true, gallery: true,
                category: { select: { name: true } }
            }
        });

        return { rawRental, rawRelatedRentals };
    },
    ['rental-detail-cache'],
    { revalidate: 60, tags: ['rental'] } // Revalidates cache every 60 seconds
);

// 🚀 2. Add SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const data = await getCachedRentalData(id);

    if (!data) return { title: "Rental Not Found | Servebasiq " };

    const { rawRental } = data;
    const sellerName = rawRental.user?.shopName || rawRental.user?.name || "Servebasiq Provider";
    const mainImage = rawRental.coverImg || rawRental.rentalImg;

    return {
        title: `${rawRental.name} by ${sellerName} | Servebasiq `,
        description: rawRental.desc.substring(0, 160),
        openGraph: {
            title: rawRental.name,
            description: rawRental.desc.substring(0, 160),
            images: mainImage ? [{ url: mainImage }] : [],
        },
    };
}

export default async function RentalDetailsPage({ params }: Props) {
    const { id } = await params;

    // 🚀 3. Fetch Session and Cached Data in parallel
    const [session, data] = await Promise.all([
        getServerSession(authOptions),
        getCachedRentalData(id)
    ]);

    if (!data) return notFound();
    const { rawRental, rawRelatedRentals } = data;

    // Formatting related rentals
    const relatedRentals = rawRelatedRentals.map((r) => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        unit: r.priceType?.toLowerCase() || 'day',
        productImage: r.coverImg || r.rentalImg,
        gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
        category: r.category,
        listingType: 'RENTAL' as const
    }));
    const rental = {
        ...rawRental,
        price: Number(rawRental.price),
        hourlyPrice: rawRental.hourlyPrice ? Number(rawRental.hourlyPrice) : null,
        dailyPrice: rawRental.dailyPrice ? Number(rawRental.dailyPrice) : null,
        weeklyPrice: rawRental.weeklyPrice ? Number(rawRental.weeklyPrice) : null,
        monthlyPrice: rawRental.monthlyPrice ? Number(rawRental.monthlyPrice) : null,
        fixedPrice: rawRental.fixedPrice ? Number(rawRental.fixedPrice) : null,
        securityDeposit: rawRental.securityDeposit ? Number(rawRental.securityDeposit) : 0,

        // 🛠️ FIX: Wrap in new Date() to safely handle both Strings and Date objects
        createdAt: new Date(rawRental.createdAt).toISOString(),
        updatedAt: new Date(rawRental.updatedAt).toISOString(),

        reviews: rawRental.reviews.map((review: any) => ({
            ...review,
            // 🛠️ FIX: Do the same for your nested reviews array
            createdAt: new Date(review.createdAt).toISOString(),
        }))
    };

    // Fetch logged in user details if needed for booking wrapper addresses
    let loggedInUser = null;
    if (session?.user?.email) {
        const rawUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { addresses: true }
        });

        if (rawUser) {
            loggedInUser = {
                ...rawUser,
                createdAt: rawUser.createdAt.toISOString(),
                updatedAt: rawUser.updatedAt.toISOString(),
            };
        }
    }

    return (
        <RentalDetailsContent
            rental={rental as any}
            relatedRentals={relatedRentals}
            session={session}
            loggedInUser={loggedInUser}
        />
    );
}