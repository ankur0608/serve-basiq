import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { name: true, isVerified: true },
                },
            },
        });

        const formattedServices = services.map((service) => ({
            ...service,
            provider: service.user?.name || "Verified Provider",
            isVerified: service.user?.isVerified || false,
        }));

        return NextResponse.json(formattedServices);
    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}
