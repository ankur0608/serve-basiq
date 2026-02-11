import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define the type for the params promise
type Props = {
    params: Promise<{ id: string }>
}

export async function GET(req: Request, props: Props) {
    // 1. AWAIT the params here 👇
    const params = await props.params;
    const serviceId = params.id;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ canReview: false, reason: 'NOT_LOGGED_IN' });
    }

    // Use session.user.id directly if available
    const userId = session.user.id;

    const hasBooking = await prisma.booking.findFirst({
        where: {
            userId: userId,
            serviceId: serviceId,
            status: 'COMPLETED',
        },
    });

    if (!hasBooking) {
        return NextResponse.json({ canReview: false, reason: 'NO_COMPLETED_BOOKING' });
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            userId: userId,
            serviceId: serviceId,
        }
    });

    if (existingReview) {
        return NextResponse.json({ canReview: false, reason: 'ALREADY_REVIEWED' });
    }

    return NextResponse.json({ canReview: true, reason: 'ELIGIBLE' });
}