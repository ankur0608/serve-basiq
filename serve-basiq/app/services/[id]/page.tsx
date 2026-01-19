// app/services/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ServiceDetailView from '@/components/services/ServiceDetailView';

// ✅ Force Next.js to not cache this page
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Service Data
  const service = await prisma.service.findUnique({
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
      reviews: { select: { id: true, rating: true } }
    }
  });

  if (!service) return notFound();

  // 2. ✅ Fetch Current Logged In User
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  let loggedInUser = null;

  if (currentUserId) {
    loggedInUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { addresses: true }
    });
  }

  // 3. Render View Component
  return (
    <ServiceDetailView
      service={service}
      loggedInUser={loggedInUser}
    />
  );
}