import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ success: false }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // ❌ WAS: services: true,
        // ✅ CHANGE TO:
        services: {
          include: {
            subcategories: {
              select: { id: true, name: true } // Fetch the IDs needed for the edit form
            }
          }
        },
        addresses: true,
        kycDetails: true,
      },
    });

    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    // ... rest of your existing code (Bookings, Orders, Stats) ...
    // ... no changes needed below here ...

    // 1. Fetch Bookings
    const bookings = await prisma.booking.findMany({
      where: { service: { userId: userId } },
      include: {
        user: { select: { name: true, phone: true, image: true } },
        service: { select: { name: true, price: true } },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Orders
    const orders = await prisma.order.findMany({
      where: { product: { userId: userId } },
      include: {
        user: { select: { name: true, phone: true, image: true } },
        product: { select: { name: true, price: true, unit: true } },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Calculate Stats
    const bookingRevenue = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((acc, curr) => acc + (curr.service.price || 0), 0);

    const orderRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    const stats = {
      revenue: bookingRevenue + orderRevenue,
      jobsCompleted: bookings.filter(b => b.status === 'COMPLETED').length + orders.filter(o => o.status === 'DELIVERED').length,
      pendingRequests: bookings.filter(b => b.status === 'PENDING').length + orders.filter(o => o.status === 'PENDING').length,
      rating: 5.0
    };

    return NextResponse.json({
      success: true,
      user,
      bookings,
      orders,
      isSetupComplete: !!(user.kycDetails && user.kycDetails.status !== "NOT_STARTED"),
      stats,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}