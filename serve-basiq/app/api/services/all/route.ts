import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: {
                categoryId: {
                    not: null
                },
                NOT: {
                    categoryId: ""
                },

                user: {
                    isVerified: true
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