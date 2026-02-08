import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // ✅ FIX: Check for ID, not Email. 
        if (!session?.user?.id) {
            // Return empty arrays instead of error so UI doesn't crash
            return NextResponse.json({ services: [], products: [] });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }, // ✅ FIX: Lookup by ID
            include: {
                favoriteServices: {
                    include: { service: true },
                    orderBy: { createdAt: 'desc' }
                },
                favoriteProducts: {
                    include: { product: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ services: [], products: [] });
        }

        // Format data
        const services = user.favoriteServices.map((f) => ({
            ...f.service,
            image: f.service.serviceimg || f.service.mainimg || "/placeholder.jpg",
            isFavorite: true
        }));

        const products = user.favoriteProducts.map((f) => ({
            ...f.product,
            image: f.product.productImage || "/placeholder.jpg",
            isFavorite: true
        }));

        return NextResponse.json({ services, products });

    } catch (error) {
        console.error("[FAVORITES_DETAILS_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}