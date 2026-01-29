import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('cat');

        console.log("🔍 API: Fetching services with categoryId:", categoryId);

        const whereClause: any = {
            isVerified: true,
            // 💡 Ensure the User linked to this service is also verified in the DB!
            user: { isVerified: true }
        };

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            take: 50,
            include: {
                category: { select: { name: true } },
                user: { select: { name: true, shopName: true, image: true, isVerified: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log(`✅ API: Found ${services.length} services.`);

        return NextResponse.json(services, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            }
        });
    } catch (error) {
        console.error("🔥 API Error:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}