import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const OrderSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    addressId: z.string().min(1, "Address is required"),

    timeline: z.enum(['URGENT', 'IMMEDIATE', 'LATER', 'FLEXIBLE']),

    specialInstructions: z.string().optional(),

    newAddress: z.object({
        line1: z.string(),
        line2: z.string(),
        landmark: z.string().optional(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
    }).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // console.log("📦 [Order API] Received Payload:", body);

        // 2. Validate with Zod
        const validation = OrderSchema.safeParse(body);

        if (!validation.success) {
            console.error("❌ Validation Failed:", validation.error.format());
            return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.format() }, { status: 400 });
        }

        const data = validation.data;
        let finalAddressId = data.addressId;

        if (data.addressId.startsWith("temp-")) {
            // console.log("🆕 Detected New Address. Creating...");

            if (!data.newAddress) {
                return NextResponse.json({ success: false, message: "New address details missing." }, { status: 400 });
            }

            const createdAddress = await prisma.address.create({
                data: {
                    userId: data.userId,
                    line1: data.newAddress.line1,
                    line2: data.newAddress.line2,
                    landmark: data.newAddress.landmark,
                    city: data.newAddress.city,
                    state: data.newAddress.state,
                    pincode: data.newAddress.pincode,
                    type: data.newAddress.type as any,
                    country: "India",
                },
            });

            finalAddressId = createdAddress.id; // Use real ID
        }

        // 4. Fetch Product Details (Price & Unit)
        // We must fetch this from DB to trust the price, never trust the frontend price.
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
            select: { price: true, unit: true, name: true }
        });

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        // 5. Calculate Total
        const totalPrice = product.price * data.quantity;

        // 6. Create Order
        const newOrder = await prisma.order.create({
            data: {
                userId: data.userId,
                productId: data.productId,
                addressId: finalAddressId, // <--- The real address ID

                quantity: data.quantity,
                unit: product.unit,        // <--- Saved from Product DB
                totalPrice: totalPrice,    // <--- Calculated securely

                timeline: data.timeline,
                specialInstructions: data.specialInstructions,

                status: 'REQUESTED',
                paymentStatus: 'PENDING',
            },
        });

        // console.log("🎉 [Order API] Order Created:", newOrder.id);

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder.id
        });

    } catch (error) {
        console.error("🔥 [Order API] Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}