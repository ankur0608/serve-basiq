import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
          
            return NextResponse.json({ services: [], products: [], rentals: [] });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }, 
            include: {
                favoriteServices: {
                    include: { service: true },
                    orderBy: { createdAt: 'desc' }
                },
                favoriteProducts: {
                    include: { product: true },
                    orderBy: { createdAt: 'desc' }
                },
                favoriteRentals: {
                    include: { rental: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ services: [], products: [], rentals: [] });
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

        const rentals = user.favoriteRentals.map((f) => ({
            ...f.rental,
            image: f.rental.rentalImg || f.rental.coverImg || "/placeholder.jpg",
            isFavorite: true
        }));

        return NextResponse.json({ services, products, rentals });

    } catch (error) {
        console.error("[FAVORITES_DETAILS_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}