import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        const cancelledBookings = await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: 'CANCELLED',
            },
            include: {
                service: true, 
                address: true,
            },
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(cancelledBookings);

    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}