import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  // console.log("🔵 [API] POST /api/favorites/toggle called");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      // console.log("🔴 [API] Unauthorized attempt");
      return new NextResponse("Unauthorized: Please log in", { status: 401 });
    }

    const body = await req.json();
    // console.log("🔵 [API] Request Body:", body);

    const { itemId, type } = body;

    if (!itemId || !type) {
      // console.log("🔴 [API] Missing itemId or type");
      return new NextResponse("Missing fields", { status: 400 });
    }

    const userId = session.user.id;

    if (type === 'SERVICE') {
      const existing = await prisma.favoriteService.findUnique({
        where: { userId_serviceId: { userId, serviceId: itemId } }
      });

      if (existing) {
        // console.log(`🔵 [API] Removing Service ${itemId} from favorites`);
        await prisma.favoriteService.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: 'removed' });
      } else {
        // console.log(`🔵 [API] Adding Service ${itemId} to favorites`);
        await prisma.favoriteService.create({ data: { userId, serviceId: itemId } });
        return NextResponse.json({ status: 'added' });
      }
    }

    else if (type === 'PRODUCT') {
      const existing = await prisma.favoriteProduct.findUnique({
        where: { userId_productId: { userId, productId: itemId } }
      });

      if (existing) {
        console.log(`🔵 [API] Removing Product ${itemId} from favorites`);
        await prisma.favoriteProduct.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: 'removed' });
      } else {
        console.log(`🔵 [API] Adding Product ${itemId} to favorites`);
        await prisma.favoriteProduct.create({ data: { userId, productId: itemId } });
        return NextResponse.json({ status: 'added' });
      }
    }

    else if (type === 'RENTAL') {
      const existing = await prisma.favoriteRental.findUnique({
        where: { userId_rentalId: { userId, rentalId: itemId } }
      });

      if (existing) {
        console.log(`🔵 [API] Removing Rental ${itemId} from favorites`);
        await prisma.favoriteRental.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: 'removed' });
      } else {
        console.log(`🔵 [API] Adding Rental ${itemId} to favorites`);
        await prisma.favoriteRental.create({ data: { userId, rentalId: itemId } });
        return NextResponse.json({ status: 'added' });
      }
    }

    console.log("🔴 [API] Invalid Type provided");
    return new NextResponse("Invalid Type", { status: 400 });

  } catch (error) {
    console.error("🔴 [API] CRITICAL ERROR in toggle:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}