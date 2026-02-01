import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

        // Fetch User with deeply nested favorites
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                favoriteServices: {
                    include: {
                        service: true // ✅ This fetches the NAME, IMAGE, PRICE
                    }
                },
                favoriteProducts: {
                    include: {
                        product: true // ✅ This fetches the NAME, IMAGE, PRICE
                    }
                }
            }
        });

        if (!user) return NextResponse.json({ services: [], products: [] });

        // Format the data so the frontend cards can read it easily
        const services = user.favoriteServices.map(f => ({
            ...f.service,
            // Ensure image field matches what ServiceCard expects
            image: f.service.serviceimg || f.service.mainimg || "",
        }));

        const products = user.favoriteProducts.map(f => ({
            ...f.product,
            // Ensure image field matches what ProductCard expects
            image: f.product.productImage || "",
            supplier: f.product.userId // Or fetch real supplier name
        }));

        return NextResponse.json({ services, products });

    } catch (error) {
        console.error("Error fetching favorite details:", error);
        return new NextResponse("Error", { status: 500 });
    }
}