import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID required" }, { status: 400 });
        }

        // 1. Get Service Details
        const service = await prisma.service.findUnique({
            where: { userId: userId },
            include: {
                // Assuming you have an Order/Booking model. 
                // If not, we return 0 for now until you create that model.
                // bookings: true 
            }
        });

        if (!service) {
            return NextResponse.json({ message: "Service profile not found" }, { status: 404 });
        }

        // 2. Calculate Stats (Mocking logic for now based on your schema)
        // In a real app, you would count `prisma.order.count({ where: { serviceId: service.id } })`
        const stats = {
            revenue: 1250, // Replace with real aggregation later
            jobsCompleted: 24,
            rating: service.rating || 5.0,
            pendingRequests: 3
        };

        return NextResponse.json({ success: true, service, stats });

    } catch (error) {
        return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
    }
}