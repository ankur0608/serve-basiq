// app/api/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim();

        if (!q || q.length < 2) {
            return NextResponse.json({ services: [], products: [], rentals: [] });
        }

        // Parallel fetch for maximum speed
        const [servicesRaw, productsRaw, rentalsRaw] = await Promise.all([
            prisma.service.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { desc: { contains: q, mode: "insensitive" } },
                    ],
                    isVerified: true,
                },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    mainimg: true,
                    serviceimg: true,
                    price: true,
                    priceType: true,
                    rating: true,
                    city: true,
                    category: { select: { name: true } },
                },
            }),
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { desc: { contains: q, mode: "insensitive" } },
                    ],
                    isVerified: true,
                },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    productImage: true,
                    price: true,
                    unit: true,
                    moq: true,
                    category: { select: { name: true } },
                    user: { select: { shopName: true, name: true } },
                },
            }),
            prisma.rental.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { desc: { contains: q, mode: "insensitive" } },
                    ],
                    isVerified: true,
                },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    rentalImg: true,
                    price: true,
                    priceType: true,
                    city: true,
                    category: { select: { name: true } },
                },
            }),
        ]);

        // Transform DB data to Frontend-Ready Card Props with safety checks
        const services = servicesRaw.map((s: any) => ({
            ...s,
            image: s.mainimg || s.serviceimg || "/placeholder.png",
            location: s.city || "Multiple Locations",
            categoryName: s.category?.name || "Service",
            type: "Service",
        }));

        const products = productsRaw.map((p: any) => ({
            ...p,
            image: p.productImage || "/placeholder.png",
            categoryName: p.category?.name || "Product",
            supplier: p.user?.shopName || p.user?.name || "Verified Seller",
            type: "Product",
        }));

        const rentals = rentalsRaw.map((r: any) => ({
            ...r,
            image: r.rentalImg || "/placeholder.png",
            location: r.city || "Multiple Locations",
            categoryName: r.category?.name || "Rental",
            type: "Rental",
        }));

        return NextResponse.json(
            { services, products, rentals },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (error) {
        console.error("❌ [SEARCH_ERROR]", error);
        return NextResponse.json(
            { error: "Search execution failed" },
            { status: 500 }
        );
    }
}
