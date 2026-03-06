import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
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
    // console.log("📝 [API] Booking Request:", body);

    const validation = BookingSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation Failed:", validation.error.format());
      return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    let finalAddressId = data.addressId;

    if (data.addressId.startsWith("temp-")) {
      // console.log("🆕 Detected New Address. Creating...");

      if (!data.newAddress) {
        return NextResponse.json({
          success: false,
          message: "New address selected but details missing."
        }, { status: 400 });
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

      // console.log("✅ Address Created with ID:", createdAddress.id);
      finalAddressId = createdAddress.id;
    }

    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        addressId: finalAddressId,

        timeline: data.timeline,

        specialInstructions: data.specialInstructions,
        status: 'REQUESTED',
      },
    });

    // console.log("🎉 Booking Created ID:", booking.id);
    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}