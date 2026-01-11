import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);

        if (!body || !body.userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        const { userId } = body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                services: true,
                addresses: true,
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // ✅ FIX: Calculate isSetupComplete
        // We consider setup complete if they have submitted Banking Info & ID Proof
        // You can adjust this logic based on your specific requirements
        const isSetupComplete = !!(
            user.bankAccountNumber &&
            user.idProofNumber &&
            user.phone
        );

        // Mock Stats (Replace with real logic later)
        const stats = {
            revenue: 1250,
            jobsCompleted: 14,
            rating: 5.0,
            pendingRequests: 3,
        };

        const servicesList = user.services || [];
        const primaryService = servicesList.length > 0 ? servicesList[0] : null;

        return NextResponse.json({
            success: true,

            // ✅ SEND THIS FIELD TO FRONTEND
            isSetupComplete,

            user,
            service: primaryService,
            services: servicesList,
            stats,
        });

    } catch (error: any) {
        console.error("🔥 [API] Stats Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}