import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    console.log("🔥 API /api/services/all was hit!"); // Debug Log

    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Found ${services.length} services`); // Debug Log
        return NextResponse.json(services);

    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}