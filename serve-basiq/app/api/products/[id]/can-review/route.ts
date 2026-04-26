import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ✅ In Next.js 15+, params in route handlers are Promises
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({
                canReview: false,
                reason: 'NOT_LOGGED_IN'
            });
        }

        const userId = session.user.id;

        // Check if the user actually ordered this product and it was delivered
        const hasDeliveredOrder = await prisma.order.findFirst({
            where: {
                userId: userId,
                productId: productId,
                status: 'DELIVERED',
            },
        });

        if (!hasDeliveredOrder) {
            return NextResponse.json({
                canReview: false,
                reason: 'NO_VERIFIED_PURCHASE',
                message: "You can only review products you have purchased and received."
            });
        }

        // Check if they already left a review
        const existingReview = await prisma.review.findFirst({
            where: {
                authorId: userId,
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

        // If they pass both checks, they can review!
        return NextResponse.json({ canReview: true, reason: 'ELIGIBLE' });

    } catch (error) {
        console.error("Error in can-review API:", error);
        return NextResponse.json({
            canReview: false,
            reason: 'SERVER_ERROR'
        }, { status: 500 });
    }
}