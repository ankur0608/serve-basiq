import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ success: false, message: "User ID missing" }, { status: 400 });

    // 1. Fetch User with all details needed for the Verification View
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        gender: true,
        dob: true,
        shopName: true,
        providerType: true,
        preferredLanguage: true,
        instagramUrl: true,
        facebookUrl: true,
        youtubeUrl: true,
        websiteUrl: true,
        addresses: true, // Needed for address mapping in VerificationView
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
        services: { select: { rating: true } }, // Used to calculate avgRating
      },
    });

    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // 2. Aggregate Rating from User's Services
    const serviceRatings = user.services.map(s => s.rating);
    const avgRating = serviceRatings.length > 0
      ? serviceRatings.reduce((a, b) => a + b, 0) / serviceRatings.length
      : 5.0;

    // 3. Define setup status for the Restriction Modal
    const setupFinished = !!(user.kycDetails && user.kycDetails.status !== "NOT_STARTED");

    // 4. Fetch Recent Bookings with Service Image and PriceType
    const recentBookings = await prisma.booking.findMany({
      where: { service: { userId: userId } },
      include: {
        user: { select: { name: true } },
        service: { select: { name: true, price: true, priceType: true, serviceimg: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 5. Fetch Recent Orders with Product Image and Unit
    const recentOrders = await prisma.order.findMany({
      where: { product: { userId: userId } },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, price: true, unit: true, productImage: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 6. Calculate Dynamic Dashboard Stats via Aggregation
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
      isSetupComplete: setupFinished, // Top-level boolean to control the modal
      user: { ...user, isSetupComplete: setupFinished, services: undefined },
      bookings: recentBookings,
      orders: recentOrders,
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