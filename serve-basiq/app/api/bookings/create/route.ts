import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  addressId: z.string().min(1, "Address is required"),
  timeline: z.enum(['IMMEDIATE', 'IN_2_DAYS', 'TWO_TO_FIVE_DAYS']),
  specialInstructions: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📝 [API] Booking Request:", body);

    const validation = BookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    const data = validation.data;

    // ✅ Clean Create Call (No dummy data needed anymore)
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        addressId: data.addressId,
        timeline: data.timeline,
        specialInstructions: data.specialInstructions,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("🔥 [API] Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}