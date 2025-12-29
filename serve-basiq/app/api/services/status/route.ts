import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                // ✅ FIX 1: Change 'service' to 'services' (Plural)
                services: true,
                addresses: true,
            },
        });

        if (!user) throw new Error("User not found");

        // Mock Stats
        const stats = {
            revenue: 1250,
            jobsCompleted: 14,
            rating: 5.0,
            pendingRequests: 3,
        };

        // ✅ FIX 2: Handle Array. We take the first service for the header, 
        // or send the whole list for the dashboard.
        const servicesList = user.services || [];
        const primaryService = servicesList.length > 0 ? servicesList[0] : null;

        return NextResponse.json({
            success: true,
            user,
            service: primaryService, // For backward compatibility
            services: servicesList,  // For new multiple service logic
            stats,
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}