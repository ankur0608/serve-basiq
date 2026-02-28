import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ServiceDetailView from '@/components/services/ServiceDetailView';

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Service AND Provider Details (Including Addresses)
  const rawService = await prisma.service.findUnique({
    where: { id: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          profileImage: true,
          isVerified: true,
          phone: true,
          shopName: true,
          instagramUrl: true,
          facebookUrl: true,
          youtubeUrl: true,
          websiteUrl: true,
          addresses: true
        }
      },
      category: { select: { name: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, image: true } } }
      }
    }
  });

  if (!rawService) return notFound();

  // 👉 2. Fetch Related Services for the Slider
  const rawRelatedServices = await prisma.service.findMany({
    where: {
      categoryId: rawService.categoryId,
      id: { not: id }
    },
    take: 8,
    select: {
      id: true,
      name: true,
      price: true,
      priceType: true,
      coverImg: true,
      serviceimg: true,
      mainimg: true,
      serviceImages: true, // ✅ Added array
      gallery: true,
      category: { select: { name: true } },
      user: { select: { shopName: true } }
    }
  });

  const relatedServices = rawRelatedServices.map(rs => ({
    ...rs,
    price: Number(rs.price),
  }));

  // 3. SMART ADDRESS LOGIC
  const providerAddresses = rawService.user.addresses || [];
  const providerWorkAddr = providerAddresses.find(a => a.type === 'Work');
  const providerHomeAddr = providerAddresses.find(a => a.type === 'Home');
  const fallbackAddr = providerWorkAddr || providerHomeAddr || providerAddresses[0];

  const finalAddressLine1 = rawService.addressLine1 || fallbackAddr?.line1 || null;
  const finalAddressLine2 = rawService.addressLine2 || fallbackAddr?.line2 || null;
  const finalCity = rawService.city || fallbackAddr?.city || null;
  const finalState = rawService.state || fallbackAddr?.state || null;
  const finalPincode = rawService.pincode || fallbackAddr?.pincode || null;
  const finalLandmark = fallbackAddr?.landmark || null;

  // 4. Data Mapping
  const service = {
    ...rawService,
    price: Number(rawService.price),
    rating: Number(rawService.rating),
    latitude: rawService.latitude ? Number(rawService.latitude) : 0,
    longitude: rawService.longitude ? Number(rawService.longitude) : 0,

    addressLine1: finalAddressLine1,
    addressLine2: finalAddressLine2,
    city: finalCity,
    state: finalState,
    pincode: finalPincode,
    landmark: finalLandmark,

    instagramUrl: (rawService as any).instagramUrl || null,
    facebookUrl: (rawService as any).facebookUrl || null,
    youtubeUrl: (rawService as any).youtubeUrl || null,
    websiteUrl: (rawService as any).websiteUrl || null,

    createdAt: rawService.createdAt.toISOString(),
    updatedAt: rawService.updatedAt.toISOString(),

    user: {
      ...rawService.user,
      instagramUrl: (rawService.user as any).instagramUrl || null,
      facebookUrl: (rawService.user as any).facebookUrl || null,
      youtubeUrl: (rawService.user as any).youtubeUrl || null,
      websiteUrl: (rawService.user as any).websiteUrl || null,
    },

    reviews: rawService.reviews.map(review => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    }))
  };

  const session = await getServerSession(authOptions);

  let loggedInUser = null;
  if (session?.user?.id) {
    const rawUser = await prisma.user.findUnique({
      where: { id: session.user.id },
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
    <ServiceDetailView
      service={service as any}
      loggedInUser={loggedInUser}
      session={session}
      relatedServices={relatedServices}
    />
  );
}