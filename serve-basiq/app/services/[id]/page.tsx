import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import ServiceDetailView from '@/components/services/ServiceDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

// 🚀 1. Cache the database queries so we aren't hitting the DB on every single page load
const getCachedServiceData = unstable_cache(
  async (id: string) => {
    const rawService = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, name: true, image: true, profileImage: true, isVerified: true,
            phone: true, shopName: true, instagramUrl: true, facebookUrl: true,
            youtubeUrl: true, websiteUrl: true, addresses: true
          }
        },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit reviews for performance
          include: { author: { select: { name: true, image: true } } }
        }
      }
    });

    if (!rawService) return null;

    const rawRelatedServices = await prisma.service.findMany({
      where: { categoryId: rawService.categoryId, id: { not: id } },
      take: 8,
      select: {
        id: true, name: true, price: true, priceType: true, coverImg: true,
        serviceimg: true, mainimg: true, serviceImages: true, gallery: true,
        category: { select: { name: true } },
        user: { select: { shopName: true } }
      }
    });

    return { rawService, rawRelatedServices };
  },
  ['service-detail-cache'],
  { revalidate: 60, tags: ['service'] } // Revalidates cache every 60 seconds
);

// 🚀 2. Add SEO Metadata for production sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCachedServiceData(id);

  if (!data) return { title: "Service Not Found | Servebasiq " };

  const { rawService } = data;
  const sellerName = rawService.user?.shopName || rawService.user?.name || "Servebasiq Provider";
  const mainImage = rawService.serviceimg || rawService.coverImg || rawService.mainimg;

  return {
    title: `${rawService.name} by ${sellerName} | Servebasiq `,
    description: rawService.desc.substring(0, 160),
    openGraph: {
      title: rawService.name,
      description: rawService.desc.substring(0, 160),
      images: mainImage ? [{ url: mainImage }] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;

  // 🚀 3. Fetch Session and Cached Data in parallel
  const [session, data] = await Promise.all([
    getServerSession(authOptions),
    getCachedServiceData(id)
  ]);

  if (!data) return notFound();
  const { rawService, rawRelatedServices } = data;

  const relatedServices = rawRelatedServices.map(rs => ({
    ...rs,
    price: Number(rs.price),
  }));

  // SMART ADDRESS LOGIC
  const providerAddresses = rawService.user.addresses || [];
  const providerWorkAddr = providerAddresses.find(a => a.type === 'Work');
  const providerHomeAddr = providerAddresses.find(a => a.type === 'Home');
  const fallbackAddr = providerWorkAddr || providerHomeAddr || providerAddresses[0];
  const formatDate = (date: any) => {
    if (!date) return new Date().toISOString();
    return typeof date === 'string' ? date : date.toISOString();
  };
  // Data Mapping
  const service = {
    ...rawService,
    price: Number(rawService.price),
    rating: Number(rawService.rating),
    latitude: rawService.latitude ? Number(rawService.latitude) : 0,
    longitude: rawService.longitude ? Number(rawService.longitude) : 0,
    addressLine1: rawService.addressLine1 || fallbackAddr?.line1 || null,
    addressLine2: rawService.addressLine2 || fallbackAddr?.line2 || null,
    city: rawService.city || fallbackAddr?.city || null,
    state: rawService.state || fallbackAddr?.state || null,
    pincode: rawService.pincode || fallbackAddr?.pincode || null,
    landmark: fallbackAddr?.landmark || null,

    // ✅ Fix: Use formatDate helper to prevent toISOString() errors
    createdAt: formatDate(rawService.createdAt),
    updatedAt: formatDate(rawService.updatedAt),

    user: {
      ...rawService.user,
      instagramUrl: (rawService.user as any).instagramUrl || null,
      facebookUrl: (rawService.user as any).facebookUrl || null,
      youtubeUrl: (rawService.user as any).youtubeUrl || null,
      websiteUrl: (rawService.user as any).websiteUrl || null,
    },

    // ✅ Fix: Also handle dates inside the reviews array
    reviews: rawService.reviews.map(review => ({
      ...review,
      createdAt: formatDate(review.createdAt),
    }))
  };

  let loggedInUser = null;
  if (session?.user?.email) {
    const rawUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { addresses: true }
    });

    if (rawUser) {
      loggedInUser = {
        ...rawUser,
        // ✅ Fix: Handle user dates too
        createdAt: formatDate(rawUser.createdAt),
        updatedAt: formatDate(rawUser.updatedAt),
      };
    }
  }

  return (
    <ServiceDetailView
      service={service as any}
      loggedInUser={loggedInUser}
      session={session}
      relatedServices={relatedServices}
      listingType="SERVICE"
    />
  );
}