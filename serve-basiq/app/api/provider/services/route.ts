import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const userSelect = {
    id: true,
    name: true,
    profileImage: true,
    shopName: true,
    isVerified: true,
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : undefined;

        const whereClause = userId ? { userId: userId } : { isVerified: true };

        const [services, rentals] = await Promise.all([
            prisma.service.findMany({
                where: whereClause,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: { select: userSelect },
                    _count: { select: { reviews: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),

            prisma.rental.findMany({
                where: whereClause,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: { select: userSelect }
                },
                orderBy: { createdAt: 'desc' },
            })
        ]);

        return NextResponse.json({ services: services || [], rentals: rentals || [] });
    } catch (error: any) {
        console.error("GET Provider Services Error:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId, id, type } = await req.json();

        if (!userId || !id || !type) {
            return NextResponse.json({ error: "Missing required fields (userId, id, or type)" }, { status: 400 });
        }

        if (type === 'RENTAL') {
            await prisma.rental.delete({ where: { id, userId } });
        } else {
            await prisma.service.delete({ where: { id, userId } });
        }

        return NextResponse.json({ message: "Successfully deleted" });
    } catch (error: any) {
        console.error("Delete API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}