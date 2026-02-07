import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client'; // ✅ Import Enum

export async function PATCH(req: Request) {
    try {
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // ✅ Updated Valid Statuses based on your new Schema
        const validStatuses = [
            'REQUESTED',
            'ACCEPTED',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
            }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                // ✅ Cast the string to the specific Enum type
                status: status as OrderStatus
            },
        });

        return NextResponse.json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}