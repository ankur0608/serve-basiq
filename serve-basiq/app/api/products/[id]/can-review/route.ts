import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Props = {
    params: Promise<{ id: string }>
}

export async function GET(req: Request, props: Props) {
    const params = await props.params;
    const productId = params.id;

    const session = await getServerSession(authOptions);

    // 1. Check Auth
    if (!session?.user?.id) {
        return NextResponse.json({
            canReview: false,
            reason: 'NOT_LOGGED_IN'
        });
    }

    const userId = session.user.id;

    // 2. Check for Verified Purchase (DELIVERED status)
    // Your Order schema links User and Product directly
    const hasDeliveredOrder = await prisma.order.findFirst({
        where: {
            userId: userId,        // The Buyer
            productId: productId,  // The Product
            status: 'DELIVERED',   // strictly check for delivered/completed
        },
    });

    if (!hasDeliveredOrder) {
        return NextResponse.json({
            canReview: false,
            reason: 'NO_VERIFIED_PURCHASE',
            message: "You can only review products you have purchased and received."
        });
    }

    // 3. Check if already reviewed
    // Note: Schema says 'authorId' is the reviewer, 'userId' is the owner
    const existingReview = await prisma.review.findFirst({
        where: {
            authorId: userId,      // The Reviewer (Current User)
            productId: productId,
        },
    });

    if (existingReview) {
        return NextResponse.json({
            canReview: false,
            reason: 'ALREADY_REVIEWED',
            message: "You have already reviewed this product."
        });
    }

    // 4. Eligible
    return NextResponse.json({ canReview: true, reason: 'ELIGIBLE' });
}