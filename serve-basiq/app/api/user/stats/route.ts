// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure correct path to authOptions

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userEmail = session.user.email;

        // Get the user ID first
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Fetch Booking Counts
        // We count total valid bookings (excluding cancellations) and cancellations separately
        const [bookingCount, cancellationCount] = await Promise.all([
            prisma.booking.count({
                where: {
                    userId: user.id,
                    status: {
                        not: "CANCELLED", // Count everything except CANCELLED (PENDING, CONFIRMED, COMPLETED)
                    },
                },
            }),
            prisma.booking.count({
                where: {
                    userId: user.id,
                    status: "CANCELLED",
                },
            }),
        ]);

        return NextResponse.json({
            bookings: bookingCount,
            cancellations: cancellationCount,
        });

    } catch (error) {
        console.error("🔥 [API] User Stats Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}