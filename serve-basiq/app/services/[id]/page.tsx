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
          // Socials
          instagramUrl: true,
          facebookUrl: true,
          youtubeUrl: true,
          websiteUrl: true,
          // ✅ FETCH PROVIDER ADDRESSES
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

  // 2. ✅ SMART ADDRESS LOGIC
  // Priority: 1. Service Specific Address -> 2. Provider Work Address -> 3. Provider Home Address
  const providerAddresses = rawService.user.addresses || [];
  const providerWorkAddr = providerAddresses.find(a => a.type === 'Work');
  const providerHomeAddr = providerAddresses.find(a => a.type === 'Home');
  const fallbackAddr = providerWorkAddr || providerHomeAddr || providerAddresses[0];

  // Determine final values
  const finalAddressLine1 = rawService.addressLine1 || fallbackAddr?.line1 || null;
  const finalAddressLine2 = rawService.addressLine2 || fallbackAddr?.line2 || null;
  const finalCity = rawService.city || fallbackAddr?.city || null;
  const finalState = rawService.state || fallbackAddr?.state || null;
  const finalPincode = rawService.pincode || fallbackAddr?.pincode || null;
  const finalLandmark = fallbackAddr?.landmark || null; // Service model usually doesn't have landmark, so we take from Provider

  // 3. Data Mapping
  const service = {
    ...rawService,
    price: Number(rawService.price),
    rating: Number(rawService.rating),
    latitude: rawService.latitude ? Number(rawService.latitude) : 0,
    longitude: rawService.longitude ? Number(rawService.longitude) : 0,

    // ✅ Mapped Address Fields
    addressLine1: finalAddressLine1,
    addressLine2: finalAddressLine2,
    city: finalCity,
    state: finalState,
    pincode: finalPincode,
    landmark: finalLandmark, // Passed to frontend

    // Socials Mapping (Service Level)
    instagramUrl: (rawService as any).instagramUrl || null,
    facebookUrl: (rawService as any).facebookUrl || null,
    youtubeUrl: (rawService as any).youtubeUrl || null,
    websiteUrl: (rawService as any).websiteUrl || null,

    createdAt: rawService.createdAt.toISOString(),
    updatedAt: rawService.updatedAt.toISOString(),

    // User Mapping
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
    />
  );
}