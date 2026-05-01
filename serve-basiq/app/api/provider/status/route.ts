import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userSelect = {
      id: true,
      name: true,
      shopName: true,
      email: true,
      image: true,
      profileImage: true,
      phone: true,
      gender: true,
      dob: true,
      preferredLanguage: true,
      addresses: true,
      kycDetails: {
        select: {
          status: true,
          idProofType: true,
          idProofNumber: true,
          idProofFrontImg: true,
          gstRegistered: true,
          gstNumber: true
        }
      },
      services: { select: { rating: true } },
    } as const;

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: userSelect,
    });

    if (!user) {
      const fallbackFilters = [
        session.user.email ? { email: session.user.email } : null,
        session.user.phone ? { phone: session.user.phone } : null,
      ].filter(Boolean) as Array<{ email?: string; phone?: string }>;

      if (fallbackFilters.length > 0) {
        user = await prisma.user.findFirst({
          where: { OR: fallbackFilters },
          select: userSelect,
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Session user not found. Please sign in again." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch the full provider snapshot for the authenticated user.
    const providerUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelect,
      },
    });

    if (!providerUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 2. Aggregate Rating from User's Services
    const serviceRatings = providerUser.services.map(s => s.rating);
    const avgRating = serviceRatings.length > 0
      ? serviceRatings.reduce((a, b) => a + b, 0) / serviceRatings.length
      : 5.0;

    // 3. Define setup status
    const setupFinished = !!(providerUser.kycDetails && providerUser.kycDetails.status !== "NOT_STARTED");

    // 4. Fetch Recent Data (Services, Products, and Rentals) in parallel for better performance
    const [recentBookings, recentOrders, recentRentals] = await Promise.all([
      prisma.booking.findMany({
        where: { service: { userId: userId } },
        include: {
          user: { select: { name: true } },
          service: { select: { name: true, price: true, priceType: true, serviceimg: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.findMany({
        where: { product: { userId: userId } },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true, price: true, unit: true, productImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.rentalBooking.findMany({
        where: { rental: { userId: userId } },
        include: {
          user: { select: { name: true } },
          // ✅ Corrected to `rentalImg` based on your schema
          rental: { select: { name: true, price: true, rentalImg: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    ]);

    // 5. Calculate Dynamic Dashboard Stats via Aggregation
    const [counts, paidOrders, paidRentals] = await Promise.all([
      prisma.booking.count({ where: { service: { userId }, status: "REQUESTED" } }),
      prisma.order.aggregate({
        where: { product: { userId }, status: "DELIVERED", paymentStatus: "PAID" },
        _sum: { totalPrice: true }
      }),
      prisma.rentalBooking.aggregate({
        where: { rental: { userId }, status: "COMPLETED", paymentStatus: "PAID" },
        _sum: { totalPrice: true }
      })
    ]);

    const totalRevenue = (paidOrders._sum.totalPrice || 0) + (paidRentals._sum.totalPrice || 0);

    return NextResponse.json({
      success: true,
      isSetupComplete: setupFinished,
      user: { ...providerUser, isSetupComplete: setupFinished, services: undefined },
      bookings: recentBookings,
      orders: recentOrders,
      rentals: recentRentals, // ✅ Return rentals to the frontend
      stats: {
        revenue: totalRevenue,
        jobsCompleted: await prisma.booking.count({ where: { service: { userId }, status: "COMPLETED" } }),
        pendingRequests: counts,
        rating: avgRating
      }
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
