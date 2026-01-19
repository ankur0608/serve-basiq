import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("📦 [Order API] Received Payload:", body);

        const {
            userId,
            productId,
            quantity,
            addressId,
            deliveryType,
            paymentMode,
            notes,
            timeline // ✅ Extract timeline
        } = body;

        // 1. Validation
        if (!userId || !productId || !quantity || !deliveryType) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (deliveryType === 'DELIVERY' && !addressId) {
            return NextResponse.json(
                { success: false, message: 'Address is required for delivery' },
                { status: 400 }
            );
        }

        // 2. Fetch Product
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true, unit: true, name: true }
        });

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // 3. Calculate Total
        const finalQuantity = Number(quantity);
        const totalPrice = product.price * finalQuantity;

        // 4. Create Order
        const newOrder = await prisma.order.create({
            data: {
                userId,
                productId,
                addressId: deliveryType === 'DELIVERY' ? addressId : null,
                quantity: finalQuantity,
                unit: product.unit,
                totalPrice: totalPrice,
                deliveryType: deliveryType,
                paymentMode: paymentMode,
                specialInstructions: notes,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                // ✅ Save Timeline (Default to IMMEDIATE if missing)
                timeline: timeline || 'IMMEDIATE',
            },
        });

        console.log("🎉 [Order API] Order Created:", newOrder.id);

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
            orderId: newOrder.id
        });

    } catch (error) {
        console.error('🔥 [Order API] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}