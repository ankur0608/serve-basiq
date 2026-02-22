import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RentalStatus } from '@prisma/client';

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { bookingId, status } = body;

        if (!bookingId || !status) {
            return NextResponse.json({ success: false, message: 'Missing ID or status' }, { status: 400 });
        }

        const validStatuses = [
            'REQUESTED',
            'ACCEPTED',    
            'IN_PROGRESS',  
            'COMPLETED',   
            'CANCELLED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
            }, { status: 400 });
        }

        const updatedRental = await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: {
                status: status as RentalStatus
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Rental status updated successfully',
            data: updatedRental
        });

    } catch (error: any) {
        console.error("Update Rental Error:", error);

        if (error.code === 'P2025') {
            return NextResponse.json({ success: false, message: 'Rental ID not found' }, { status: 404 });
        }

        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}