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
  addressId: z.string().optional().nullable(),
  slotId: z.string().optional().nullable(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).default('PICKUP'),
  pricingModel: z.enum(["DAILY", "MONTHLY", "FIXED", "HOURLY", "WEEKLY", "QUOTE", "SLOT"]),
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

    let finalAddressId = data.addressId;

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

    // ✅ UPDATED: Fetching rental item details AND the owner's details
    const rentalItem = await prisma.rental.findUnique({
      where: { id: data.rentalId },
      select: {
        id: true,
        name: true,
        hourlyPrice: true,
        dailyPrice: true,
        weeklyPrice: true,
        monthlyPrice: true,
        fixedPrice: true,
        price: true,
        isAvailable: true,
        advanceNotice: true,
        user: true,
      }
    });

    if (!rentalItem) {
      return NextResponse.json({ success: false, message: "Rental item not found" }, { status: 404 });
    }

    if (rentalItem.isAvailable === false) {
      return NextResponse.json(
        { success: false, message: "This rental is currently unavailable" },
        { status: 409 }
      );
    }

    // Enforce advance notice requirement
    if (rentalItem.advanceNotice && rentalItem.advanceNotice > 0) {
      const minStart = new Date();
      minStart.setDate(minStart.getDate() + rentalItem.advanceNotice);
      minStart.setHours(0, 0, 0, 0);
      if (start < minStart) {
        return NextResponse.json(
          { success: false, message: `This rental requires at least ${rentalItem.advanceNotice} day(s) advance notice. Earliest available date: ${minStart.toISOString().split('T')[0]}` },
          { status: 400 }
        );
      }
    }

    // Validate slot if one was chosen
    let pickedSlot: { id: string; isBooked: boolean; isActive: boolean; rentalId: string } | null = null;
    if (data.slotId) {
      const slot = await prisma.rentalSlot.findUnique({
        where: { id: data.slotId },
        select: { id: true, isBooked: true, isActive: true, rentalId: true },
      });
      if (!slot || slot.rentalId !== data.rentalId) {
        return NextResponse.json(
          { success: false, message: "Invalid slot" },
          { status: 400 }
        );
      }
      if (!slot.isActive || slot.isBooked) {
        return NextResponse.json(
          { success: false, message: "Slot is no longer available" },
          { status: 409 }
        );
      }
      pickedSlot = slot;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let finalTotalPrice = 0;

    let appliedHourlyPrice = rentalItem.hourlyPrice ?? (rentalItem.price / 24);
    let appliedDailyPrice = rentalItem.dailyPrice ?? rentalItem.price;
    let appliedWeeklyPrice = rentalItem.weeklyPrice ?? (rentalItem.price * 7);
    let appliedMonthlyPrice = rentalItem.monthlyPrice ?? (rentalItem.price * 30);
    let appliedFixedPrice = rentalItem.fixedPrice ?? rentalItem.price;

    switch (data.pricingModel) {
      case 'HOURLY':
        finalTotalPrice = appliedHourlyPrice * (diffDays * 24);
        break;
      case 'DAILY':
        finalTotalPrice = appliedDailyPrice * diffDays;
        break;
      case 'WEEKLY':
        const weeks = Math.max(1, Math.ceil(diffDays / 7));
        finalTotalPrice = appliedWeeklyPrice * weeks;
        break;
      case 'MONTHLY':
        const months = Math.max(1, Math.ceil(diffDays / 30));
        finalTotalPrice = appliedMonthlyPrice * months;
        break;
      case 'FIXED':
        finalTotalPrice = appliedFixedPrice;
        break;
      case 'QUOTE':
        finalTotalPrice = 0;
        break;
      case 'SLOT':
        // price per slot; one slot selected per booking
        finalTotalPrice = rentalItem.price;
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

    // ✅ Transactional: create booking + (optionally) lock the slot atomically
    const newBooking = await prisma.$transaction(async (tx) => {
      if (pickedSlot) {
        const lock = await tx.rentalSlot.updateMany({
          where: { id: pickedSlot.id, isBooked: false, isActive: true },
          data: { isBooked: true },
        });
        if (lock.count === 0) {
          throw new Error("SLOT_TAKEN");
        }
      }

      return tx.rentalBooking.create({
        data: {
          userId: session.user.id,
          rentalId: data.rentalId,
          addressId: finalAddressId,
          slotId: pickedSlot?.id ?? null,
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
        include: { user: true },
      });
    }).catch((err) => {
      if (err?.message === "SLOT_TAKEN") return null;
      throw err;
    });

    if (!newBooking) {
      return NextResponse.json(
        { success: false, message: "Slot was just booked by someone else. Pick another." },
        { status: 409 }
      );
    }

    // ==========================================
    // 📱 MSG91 WHATSAPP NOTIFICATION LOGIC
    // ==========================================

    const providerPhone = rentalItem.user?.phone;
    console.log("📱 Extracted Owner Phone:", providerPhone);

    if (providerPhone) {
      let formattedPhone = providerPhone.replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

      console.log("📞 Formatted Phone for MSG91:", formattedPhone);

      const providerName = rentalItem.user?.name || rentalItem.user?.shopName || 'Owner';
      const customerName = newBooking.user?.name || session.user?.name || 'A customer';
      const serviceName = rentalItem.name || 'a rental item';

      console.log(`👤 Owner: ${providerName}, 👤 Customer: ${customerName}, 📦 Item: ${serviceName}`);

      const authKey = process.env.MSG91_AUTH_KEY;
      const waNumber = process.env.MSG91_WA_NUMBER;

      if (authKey && waNumber) {
        const payloadBody = {
          integrated_number: waNumber,
          content_type: 'template',
          payload: {
            messaging_product: 'whatsapp',
            type: 'template',
            template: {
              name: 'new_booking_alert', 
              language: {
                code: 'en',
                policy: 'deterministic'
              },
              namespace: 'ab2852b6_db9d_4746_932c_e66d6d7d2034',
              to_and_components: [
                {
                  to: [formattedPhone],
                  components: {
                    body_service_name: {
                      type: 'text',
                      value: serviceName, // Passing the rental item name
                      parameter_name: 'service_name'
                    },
                    body_provider_name: {
                      type: 'text',
                      value: providerName,
                      parameter_name: 'provider_name'
                    },
                    body_customer_name: {
                      type: 'text',
                      value: customerName,
                      parameter_name: 'customer_name'
                    }
                  }
                }
              ]
            }
          }
        };

        const msg91Options = {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authkey': authKey
          },
          body: JSON.stringify(payloadBody)
        };

        try {
          console.log("⏳ Awaiting MSG91 response...");
          const waRes = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', msg91Options);
          const waData = await waRes.json();

          if (waData.hasError) {
            console.error("⚠️ MSG91 API Error detected in response!");
          } else {
            console.log("✅ WhatsApp message successfully queued by MSG91!");
          }
        } catch (msgError) {
          console.error('🔥 Failed to send WhatsApp notification:', msgError);
        }
      } else {
        console.warn("⚠️ Missing MSG91_AUTH_KEY or MSG91_WA_NUMBER in environment variables.");
      }
    } else {
      console.log("ℹ️ No owner phone number found, skipping WhatsApp notification.");
    }

    // ==========================================

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