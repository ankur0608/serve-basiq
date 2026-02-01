import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Fix: Strict check for email to satisfy TypeScript
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ services: [], products: [] });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                favoriteServices: { select: { serviceId: true } },
                favoriteProducts: { select: { productId: true } }
            }
        });

        // Handle case where user might not be found in DB even if session exists
        if (!user) {
            return NextResponse.json({ services: [], products: [] });
        }

        const serviceIds = user.favoriteServices.map(f => f.serviceId);
        const productIds = user.favoriteProducts.map(f => f.productId);

        return NextResponse.json({ services: serviceIds, products: productIds });
    } catch (error) {
        console.error("[FAVORITES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}