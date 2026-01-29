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

  const rawService = await prisma.service.findUnique({
    where: { id: id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          isVerified: true,
          phone: true,
          shopName: true,
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

  // ✅ SANITIZE DATA: Convert Decimal objects to plain Numbers/Strings
  // This prevents the "Only plain objects can be passed" error
  const service = {
    ...rawService,
    price: Number(rawService.price),
    rating: Number(rawService.rating),
    latitude: rawService.latitude ? Number(rawService.latitude) : null,
    longitude: rawService.longitude ? Number(rawService.longitude) : null,
    createdAt: rawService.createdAt.toISOString(),
    updatedAt: rawService.updatedAt.toISOString(),
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