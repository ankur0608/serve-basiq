import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path matches your auth config

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Fix: Ensure email exists and is not null/undefined
    if (!session || !session.user || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId, type } = await req.json(); // type: 'SERVICE' | 'PRODUCT'

    if (!itemId || !type) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Fetch the user ID based on the email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    if (type === 'SERVICE') {
      const existing = await prisma.favoriteService.findUnique({
        where: {
          userId_serviceId: { userId: user.id, serviceId: itemId }
        }
      });

      if (existing) {
        await prisma.favoriteService.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: 'removed' });
      } else {
        await prisma.favoriteService.create({
          data: { userId: user.id, serviceId: itemId }
        });
        return NextResponse.json({ status: 'added' });
      }
    }

    else if (type === 'PRODUCT') {
      const existing = await prisma.favoriteProduct.findUnique({
        where: {
          userId_productId: { userId: user.id, productId: itemId }
        }
      });

      if (existing) {
        await prisma.favoriteProduct.delete({ where: { id: existing.id } });
        return NextResponse.json({ status: 'removed' });
      } else {
        await prisma.favoriteProduct.create({
          data: { userId: user.id, productId: itemId }
        });
        return NextResponse.json({ status: 'added' });
      }
    }

    return new NextResponse("Invalid type", { status: 400 });

  } catch (error) {
    console.error("[FAVORITES_TOGGLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}