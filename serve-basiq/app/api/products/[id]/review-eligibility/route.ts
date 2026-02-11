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

    if (!session?.user?.email) {
        return NextResponse.json({ canReview: false, reason: 'NOT_LOGGED_IN' });
    }

    const userId = session.user.id;

    // 1. Check if user bought the product AND it is delivered
    // This assumes you have an Order model with OrderItems
    // const hasOrder = await prisma.order.findFirst({
    //     where: {
    //         userId: userId,
    //         status: 'DELIVERED', // Only allow confirmed/delivered purchases
    //         items: {
    //             some: {
    //                 productId: productId
    //             }
    //         }
    //     },
    // });

    // if (!hasOrder) {
    //     return NextResponse.json({ canReview: false, reason: 'NO_VERIFIED_PURCHASE' });
    // }

    // 2. Check if already reviewed
    const existingReview = await prisma.review.findFirst({
        where: {
            userId: userId,
            productId: productId,
        }
    });

    if (existingReview) {
        return NextResponse.json({ canReview: false, reason: 'ALREADY_REVIEWED' });
    }

    return NextResponse.json({ canReview: true, reason: 'ELIGIBLE' });
}