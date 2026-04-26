import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import RentalDetailsContent from '@/components/Rental/RentalDetailsContent';
import { toOgImageUrl, OG_IMAGE_DIMENSIONS } from '@/lib/og-image';

interface Props {
    params: Promise<{ id: string }>;
}

// ─────────────────────────────────────────────
// 🚀 FIX 1: Lightweight pre-fetch to get categoryId
//    so we can run both main queries in parallel.
// ─────────────────────────────────────────────
const getCachedRentalMeta = unstable_cache(
    async (id: string) => {
        const meta = await prisma.rental.findUnique({
            where: { id },
            select: { categoryId: true }
        });
        return meta;
    },
    ['rental-meta-cache'],
    { revalidate: 300, tags: ['rental'] }
);

// ─────────────────────────────────────────────
// 🚀 FIX 2: Both main queries now run in PARALLEL
//    inside the cache using Promise.all.
//    Previously: findUnique finished → then findMany started (~2× DB wait).
//    Now: both fire simultaneously.
// ─────────────────────────────────────────────
const getCachedRentalData = unstable_cache(
    async (id: string, categoryId: string) => {
        const [rawRental, rawRelatedRentals] = await Promise.all([
            prisma.rental.findUnique({
                where: { id },
                include: {
                    category: { select: { name: true } },
                    subcategory: { select: { name: true } },
                    reviews: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        select: {
                            id: true, rating: true, comment: true, images: true, createdAt: true,
                            author: { select: { id: true, name: true, image: true } },
                        }
                    },
                    user: {
                        select: {
                            id: true, name: true, shopName: true, email: true, phone: true,
                            isVerified: true, image: true, profileImage: true,
                            instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true,
                            addresses: {
                                select: {
                                    id: true, type: true, line1: true, line2: true, landmark: true,
                                    city: true, state: true, pincode: true,
                                },
                                take: 5,
                            }
                        }
                    }
                }
            }),
            prisma.rental.findMany({
                where: { categoryId, id: { not: id } },
                take: 8,
                select: {
                    id: true, name: true, price: true, priceType: true,
                    coverImg: true, rentalImg: true, gallery: true,
                    category: { select: { name: true } }
                }
            })
        ]);

        if (!rawRental) return null;
        return { rawRental, rawRelatedRentals };
    },
    ['rental-detail-cache'],
    { revalidate: 60, tags: ['rental'] }
);

// ─────────────────────────────────────────────
// 🚀 FIX 3: loggedInUser is now cached separately
//    Previously it ran on EVERY request outside the cache, adding an
//    extra uncached DB round-trip. Now cached for 30s per email.
// ─────────────────────────────────────────────
const getCachedUser = unstable_cache(
    async (email: string) => {
        const rawUser = await prisma.user.findUnique({
            where: { email },
            include: {
                addresses: {
                    select: {
                        id: true, type: true, line1: true, line2: true, landmark: true,
                        city: true, state: true, pincode: true,
                    },
                    take: 10,
                }
            }
        });
        if (!rawUser) return null;
        return {
            ...rawUser,
            createdAt: rawUser.createdAt.toISOString(),
            updatedAt: rawUser.updatedAt.toISOString(),
        };
    },
    ['user-by-email'],
    { revalidate: 30, tags: ['user'] }
);

// Pre-render the most recently verified rentals at build time (ISR covers the rest on-demand)
export async function generateStaticParams() {
    const rentals = await prisma.rental.findMany({
        where: { isVerified: true, user: { isVerified: true } },
        select: { id: true },
        orderBy: { updatedAt: 'desc' },
        take: 100,
    });
    return rentals.map((r) => ({ id: r.id }));
}

// ─────────────────────────────────────────────
// SEO Metadata
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const meta = await getCachedRentalMeta(id);
    if (!meta || !meta.categoryId) return { title: "Rental Not Found" };

    const data = await getCachedRentalData(id, meta.categoryId);
    if (!data) return { title: "Rental Not Found" };

    const { rawRental } = data;
    const sellerName = rawRental.user?.shopName || rawRental.user?.name || "Servebasiq Provider";
    const rawMainImage = rawRental.coverImg || rawRental.rentalImg;
    const ogImage = toOgImageUrl(rawMainImage);
    const description = rawRental.desc?.substring(0, 160) || `Rent ${rawRental.name} from ${sellerName} on ServeBasiq.`;
    const canonical = `/rentals/${id}`;
    const title = `${rawRental.name} by ${sellerName}`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type: 'website',
            url: canonical,
            title,
            description,
            images: [{
                url: ogImage,
                secureUrl: ogImage,
                type: 'image/jpeg',
                width: OG_IMAGE_DIMENSIONS.width,
                height: OG_IMAGE_DIMENSIONS.height,
                alt: rawRental.name,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    };
}

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────
export default async function RentalDetailsPage({ params }: Props) {
    const { id } = await params;

    // Step 1: Get categoryId (tiny cached query, needed to parallelize main fetch)
    const meta = await getCachedRentalMeta(id);
    if (!meta || !meta.categoryId) return notFound();

    // Step 2: Session + main rental data fire in parallel
    const [session, data] = await Promise.all([
        getServerSession(authOptions),
        getCachedRentalData(id, meta.categoryId)
    ]);

    if (!data) return notFound();
    const { rawRental, rawRelatedRentals } = data;

    // Step 3: Fetch logged-in user (cached, non-blocking with the above)
    let loggedInUser = null;
    if (session?.user?.email) {
        loggedInUser = await getCachedUser(session.user.email);
    }

    // ── Format related rentals ──────────────────
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

    // ── Format rental object ────────────────────
    const rental = {
        ...rawRental,
        price: Number(rawRental.price),
        hourlyPrice: rawRental.hourlyPrice ? Number(rawRental.hourlyPrice) : null,
        dailyPrice: rawRental.dailyPrice ? Number(rawRental.dailyPrice) : null,
        weeklyPrice: rawRental.weeklyPrice ? Number(rawRental.weeklyPrice) : null,
        monthlyPrice: rawRental.monthlyPrice ? Number(rawRental.monthlyPrice) : null,
        fixedPrice: rawRental.fixedPrice ? Number(rawRental.fixedPrice) : null,
        securityDeposit: rawRental.securityDeposit ? Number(rawRental.securityDeposit) : 0,
        createdAt: new Date(rawRental.createdAt).toISOString(),
        updatedAt: new Date(rawRental.updatedAt).toISOString(),
        reviews: rawRental.reviews.map((review: any) => ({
            ...review,
            createdAt: new Date(review.createdAt).toISOString(),
        }))
    };

    const sellerName = rawRental.user?.shopName || rawRental.user?.name || "Servebasiq Provider";
    const mainImage = rawRental.coverImg || rawRental.rentalImg;
    const priceUnit = (rawRental.priceType || 'DAILY').toLowerCase();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: rawRental.name,
        description: rawRental.desc,
        ...(mainImage && { image: mainImage }),
        ...(rawRental.category?.name && { category: rawRental.category.name }),
        brand: { '@type': 'Brand', name: sellerName },
        offers: {
            '@type': 'Offer',
            price: Number(rawRental.price),
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: Number(rawRental.price),
                priceCurrency: 'INR',
                unitCode: priceUnit,
            },
            seller: { '@type': 'Organization', name: sellerName },
            url: `https://www.servebasiq.in/rentals/${id}`,
        },
        ...(rawRental.reviews.length > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue:
                    rawRental.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) /
                    rawRental.reviews.length,
                reviewCount: rawRental.reviews.length,
            },
        }),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.servebasiq.in' },
            { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://www.servebasiq.in/rentals' },
            { '@type': 'ListItem', position: 3, name: rawRental.name },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <RentalDetailsContent
                rental={rental as any}
                relatedRentals={relatedRentals}
                session={session}
                loggedInUser={loggedInUser}
            />
        </>
    );
}