import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ success: false, message: "User ID missing" }, { status: 400 });

    // 1. Fetch User Only
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        kycDetails: true,
      },
    });

    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // ❌ REMOVED: Bookings and Orders fetching logic
    // ❌ REMOVED: Revenue calculation logic

    // 2. Return Default Stats
    // Since we aren't fetching data, we return 0 to keep the UI valid
    const stats = {
      revenue: 0,
      jobsCompleted: 0,
      pendingRequests: 0,
      rating: 5.0
    };

    return NextResponse.json({
      success: true,
      user,
      bookings: [], // Return empty array so .map() in frontend doesn't break
      orders: [],   // Return empty array so .map() in frontend doesn't break
      isSetupComplete: !!(user.kycDetails && user.kycDetails.status !== "NOT_STARTED"),
      stats,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}