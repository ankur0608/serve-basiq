import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('cat');

        const whereClause: any = {
            isVerified: true,
            categoryId: { not: null },
            user: { isVerified: true }
        };

        if (categoryId) {
            // ✅ Prisma will find exact match or match by ID if you use UUIDs
            whereClause.categoryId = categoryId;
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            take: 50, // ⚡ Limit to 50 items to prevent massive slow loads
            include: {
                category: { select: { name: true } },
                user: { select: { name: true, shopName: true, image: true, isVerified: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(services, {
            // ⚡ Cache Control: Cache for 60 seconds on CDN/Browser
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            }
        });
    } catch (error) {
        console.error("🔥 Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}