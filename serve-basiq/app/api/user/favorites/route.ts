import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    // console.log("🔵 [API] GET /api/user/favorites called");

    try {
        const session = await getServerSession(authOptions);
        // console.log("🔵 [API] Session found:", session ? "YES" : "NO");

        if (!session?.user?.id) {
            // console.log("🔴 [API] 401: No User ID in session");
            return NextResponse.json({ services: [], products: [], rentals: [] });
        }

        // console.log(`🔵 [API] Fetching favorites for User ID: ${session.user.id}`);

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                favoriteServices: { select: { serviceId: true } },
                favoriteProducts: { select: { productId: true } },
                favoriteRentals: { select: { rentalId: true } }
            }
        });

        if (!user) {
            // console.log("🔴 [API] User not found in DB");
            return NextResponse.json({ services: [], products: [], rentals: [] });
        }

        const serviceIds = user.favoriteServices.map(f => f.serviceId);
        const productIds = user.favoriteProducts.map(f => f.productId);
        const rentalIds = user.favoriteRentals.map(f => f.rentalId);

        // console.log(`🟢 [API] Success. Found ${serviceIds.length} services and ${productIds.length} products.`);

        return NextResponse.json({ services: serviceIds, products: productIds, rentals: rentalIds });

    } catch (error) {
        console.error("🔴 [API] CRITICAL ERROR in /api/user/favorites:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}