// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path to your Prisma client instance

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q) {
            return NextResponse.json({ services: [], products: [], rentals: [] });
        }

        // We use Promise.all to fetch from all 3 tables simultaneously for maximum speed
        const [services, products, rentals] = await Promise.all([
            prisma.service.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { desc: { contains: q, mode: 'insensitive' } },
                    ],
                    isVerified: true, // Only show verified listings
                },
                take: 12,
                select: { id: true, name: true, mainimg: true, serviceimg: true, price: true, priceType: true, rating: true, city: true },
            }),
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { desc: { contains: q, mode: 'insensitive' } },
                    ],
                    isVerified: true,
                },
                take: 12,
                // ✅ FIX: Removed 'condition: true' to resolve the TypeScript error
                select: { id: true, name: true, productImage: true, price: true, unit: true },
            }),
            prisma.rental.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { desc: { contains: q, mode: 'insensitive' } },
                    ],
                    isVerified: true,
                },
                take: 12,
                select: { id: true, name: true, rentalImg: true, price: true, priceType: true, city: true },
            }),
        ]);

        return NextResponse.json({ services, products, rentals });
    } catch (error) {
        console.error("[SEARCH_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}