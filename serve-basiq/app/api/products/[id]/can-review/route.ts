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

    if (!session?.user?.id) {
        return NextResponse.json({
            canReview: false,
            reason: 'NOT_LOGGED_IN'
        });
    }

    const userId = session.user.id;

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

    return NextResponse.json({ canReview: true, reason: 'ELIGIBLE' });
}