import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // ✅ Correct Import
import { authOptions } from "@/lib/auth";     // ✅ Correct Import

export async function POST(req: Request) {
    try {
        // 1. Authenticate User (Updated for your setup)
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { rentalId, startDate, endDate, addressId, deliveryType, notes } = body;

        // 2. Validate Input
        if (!rentalId || !startDate || !endDate) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return NextResponse.json({ success: false, message: "End date must be after start date" }, { status: 400 });
        }

        // 3. Check if Item exists & Get Price
        const rentalItem = await prisma.rental.findUnique({
            where: { id: rentalId },
            select: { price: true, priceType: true, id: true }
        });

        if (!rentalItem) {
            return NextResponse.json({ success: false, message: "Rental item not found" }, { status: 404 });
        }

        // 4. CHECK AVAILABILITY (Prevent Double Booking)
        // We look for any booking for this item that overlaps with the requested dates
        const conflict = await prisma.rentalBooking.findFirst({
            where: {
                rentalId: rentalId,
                status: { in: ['APPROVED', 'ACTIVE'] }, // Only check active/approved bookings
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start }
                    }
                ]
            }
        });

        if (conflict) {
            return NextResponse.json({ success: false, message: "Item is already booked for these dates" }, { status: 409 });
        }

        // 5. Calculate Total Price
        // Calculate difference in days (ceiling is safer to ensure partial days count as 1)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

        const totalPrice = rentalItem.price * diffDays;

        // 6. Create Booking
        const newBooking = await prisma.rentalBooking.create({
            data: {
                userId: session.user.id, // Using the ID from the session
                rentalId: rentalId,
                startDate: start,
                endDate: end,
                totalDays: diffDays,
                pricePerDay: rentalItem.price,
                totalPrice: totalPrice,
                deliveryType: deliveryType || 'PICKUP',
                addressId: deliveryType === 'DELIVERY' ? addressId : null,
                specialInstructions: notes,
                status: 'REQUESTED'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Rental request sent successfully!",
            bookingId: newBooking.id
        });

    } catch (error) {
        console.error("Rental Booking Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}