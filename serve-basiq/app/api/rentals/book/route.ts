import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// 1. Zod Schema
const RentalBookingSchema = z.object({
  rentalId: z.string().min(1, "Rental ID is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  // Allow null for Pickup scenarios
  addressId: z.string().optional().nullable(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).default('PICKUP'),
  pricingModel: z.enum(['DAILY', 'MONTHLY', 'FIXED']).default('DAILY'),
  minDuration: z.enum(['ONE_HOUR', 'ONE_DAY', 'SEVEN_DAYS', 'FIFTEEN_DAYS', 'THIRTY_DAYS']).default('ONE_DAY'),
  notes: z.string().optional(),
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📝 [Rental API] Request:", body);

    const validation = RentalBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      return NextResponse.json({ success: false, message: "End date must be after start date" }, { status: 400 });
    }

    let finalAddressId: string | null | undefined = data.addressId;

    if (data.deliveryType === 'DELIVERY') {
      if (!finalAddressId) {
        return NextResponse.json({ success: false, message: "Address is required for delivery" }, { status: 400 });
      }

      if (finalAddressId.startsWith("temp-")) {
        if (!data.newAddress) {
          return NextResponse.json({ success: false, message: "New address details missing" }, { status: 400 });
        }
        const createdAddress = await prisma.address.create({
          data: {
            userId: session.user.id,
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
        finalAddressId = createdAddress.id;
      }
    } else {
      finalAddressId = null;
    }

    const rentalItem = await prisma.rental.findUnique({
      where: { id: data.rentalId },
      select: {
        id: true,
        dailyPrice: true,
        monthlyPrice: true,
        fixedPrice: true,
        price: true
      }
    });

    if (!rentalItem) {
      return NextResponse.json({ success: false, message: "Rental item not found" }, { status: 404 });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let finalTotalPrice = 0;

    let appliedDailyPrice = rentalItem.dailyPrice ?? rentalItem.price;
    let appliedMonthlyPrice = rentalItem.monthlyPrice ?? (rentalItem.price * 30);
    let appliedFixedPrice = rentalItem.fixedPrice ?? rentalItem.price;

    switch (data.pricingModel) {
      case 'DAILY':
        finalTotalPrice = appliedDailyPrice * diffDays;
        break;
      case 'MONTHLY':
        const months = Math.max(1, Math.ceil(diffDays / 30));
        finalTotalPrice = appliedMonthlyPrice * months;
        break;
      case 'FIXED':
        finalTotalPrice = appliedFixedPrice;
        break;
    }

    const conflict = await prisma.rentalBooking.findFirst({
      where: {
        rentalId: data.rentalId,
        status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({ success: false, message: "Item is already booked for these dates" }, { status: 409 });
    }

    const newBooking = await prisma.rentalBooking.create({
      data: {
        userId: session.user.id,
        rentalId: data.rentalId,
        addressId: finalAddressId, 
        startDate: start,
        endDate: end,
        totalDays: diffDays,

        pricingModel: data.pricingModel,
        minDuration: data.minDuration,

        dailyRentalPrice: appliedDailyPrice,
        monthlyRentalPrice: appliedMonthlyPrice,
        fixedRentalPrice: appliedFixedPrice,

        totalPrice: finalTotalPrice,

        status: 'REQUESTED',
        paymentStatus: 'PENDING',
        deliveryType: data.deliveryType,
        specialInstructions: data.notes,
      },
    });

    console.log("🎉 Rental Booking Created:", newBooking.id);

    return NextResponse.json({
      success: true,
      message: "Rental request sent successfully!",
      bookingId: newBooking.id
    });

  } catch (error) {
    console.error("🔥 Rental Booking Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}