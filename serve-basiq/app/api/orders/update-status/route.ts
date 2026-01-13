import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
    try {
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status },
        });

        return NextResponse.json({ success: true, data: updatedOrder });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}