import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: {
                // 1. The Service listing itself must be verified (Admin Approval)
                isVerified: true,

                // 2. Must have a valid category
                categoryId: {
                    not: null
                },

                // 3. The Provider (User) must be verified (KYC)
                user: {
                    isVerified: true
                }
            },
            include: {
                // ✅ Include Category Name for filters/UI
                category: {
                    select: {
                        name: true
                    }
                },
                // ✅ Include User Details (Provider)
                user: {
                    select: {
                        name: true,
                        shopName: true, // Helpful for display priority
                        image: true,    // ✅ FIXED: Schema uses 'image', not 'img'
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
        console.error("🔥 Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}