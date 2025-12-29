import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Ensure no caching for real-time updates

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: {
                // ✅ CRITICAL FIX: Only show services that have selected a category
                categoryId: {
                    not: null
                },
                // Optional: Ensure they are not strictly empty strings if your logic allows that
                NOT: {
                    categoryId: ""
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        img: true,
                        isVerified: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}