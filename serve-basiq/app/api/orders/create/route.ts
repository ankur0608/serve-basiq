import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 🔍 LOG 1: Incoming Payload
        console.log("📦 [Order API] Received Payload:", body);

        const {
            userId,
            productId,
            quantity,
            addressId,
            deliveryType, // "PICKUP" or "DELIVERY"
            paymentMode,  // "CASH" or "ONLINE"
            notes
        } = body;

        // 1. Validation
        if (!userId || !productId || !quantity || !deliveryType) {
            console.warn("⚠️ [Order API] Missing required fields:", { userId, productId, quantity, deliveryType });
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (deliveryType === 'DELIVERY' && !addressId) {
            console.warn("⚠️ [Order API] Delivery selected but Address ID is missing.");
            return NextResponse.json(
                { success: false, message: 'Address is required for delivery' },
                { status: 400 }
            );
        }

        // 2. Fetch Product to get Price & Unit
        // We fetch the price from DB to prevent frontend manipulation
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true, unit: true, name: true }
        });

        // 🔍 LOG 2: Product Database Lookup
        if (!product) {
            console.error(`❌ [Order API] Product not found for ID: ${productId}`);
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }
        console.log("✅ [Order API] Product Found:", product.name, "| Price:", product.price);

        // 3. Calculate Total Price
        const finalQuantity = Number(quantity);
        const totalPrice = product.price * finalQuantity;

        console.log(`💰 [Order API] Calculated Total: ${totalPrice} (Qty: ${finalQuantity} * Price: ${product.price})`);

        // 4. Create Order
        const newOrder = await prisma.order.create({
            data: {
                userId,
                productId,
                addressId: deliveryType === 'DELIVERY' ? addressId : null, // Null if pickup
                quantity: finalQuantity,
                unit: product.unit, // Use the product's actual unit
                totalPrice: totalPrice,
                deliveryType: deliveryType,
                paymentMode: paymentMode, // ✅ Using the reused Enum
                specialInstructions: notes,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            },
        });

        // 🔍 LOG 3: Success
        console.log("🎉 [Order API] Order Created Successfully. Order ID:", newOrder.id);

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
            orderId: newOrder.id
        });

    } catch (error) {
        console.error('🔥 [Order API] Fatal Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}