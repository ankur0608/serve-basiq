import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. Define Validation Schema (Matches your Prisma Enums)
const BookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  addressId: z.string().min(1, "Address is required"),
  
  // Date comes as a string "YYYY-MM-DD" from input type="date"
  bookingDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: "Valid date is required",
  }),
  
  timeSlot: z.string().min(1, "Time slot is required"),
  
  // Enums must match your Prisma Schema exactly
  propertyType: z.enum(['FLAT', 'VILLA', 'OFFICE', 'OTHER']),
  paymentMode: z.enum(['CASH', 'ONLINE']),
  
  specialInstructions: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📝 [API] Booking Request Received:", body);

    // 2. Validate the Request Body
    const validation = BookingSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation Error:", validation.error.format());
      return NextResponse.json({ 
        success: false, 
        message: "Invalid input data", 
        errors: validation.error.format() 
      }, { status: 400 });
    }

    const data = validation.data;

    // 3. Create Booking in Database
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        addressId: data.addressId,
        
        // Convert string date to DateTime object
        bookingDate: new Date(data.bookingDate),
        
        timeSlot: data.timeSlot,
        propertyType: data.propertyType,
        paymentMode: data.paymentMode,
        specialInstructions: data.specialInstructions || null,
        couponCode: data.couponCode || null,
        
        // Default status is 'PENDING' via Prisma schema
      },
      // Include related data to return to frontend if needed
      include: {
        service: {
          select: { name: true, price: true }
        },
        address: true
      }
    });

    console.log("✅ [API] Booking Created Successfully:", booking.id);

    return NextResponse.json({ 
      success: true, 
      message: "Booking request sent successfully!",
      booking 
    });

  } catch (error: any) {
    console.error("🔥 [API] Create Booking Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process booking. Please try again." 
    }, { status: 500 });
  }
}