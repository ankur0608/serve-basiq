import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    // ✅ FIX 1: Change 'service' to 'services' (Plural) in the include
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: true, // It is an array now []
        addresses: true,
      },
    });

    if (!user) throw new Error("User not found");

    // ✅ FIX 2: Handle the array. Let's check the FIRST service for the "Setup" logic.
    // If they have at least one service, we check its details.
    const firstService = user.services?.[0];

    // 1. Service Details Check
    const hasServiceDetails = !!(
      firstService &&
      firstService.categoryId &&
      firstService.latitude !== null &&
      firstService.workingDays.length > 0
    );

    // 2. Verification Details Check
    const hasVerification = !!(
      user.bankAccountNumber &&
      user.idProofImg
    );

    const isSetupComplete = hasServiceDetails && hasVerification;

    // --- Mock Stats ---
    // ✅ FIX 3: Use the first service for rating (or average them if you prefer later)
    const stats = {
      revenue: 1250,
      jobsCompleted: 14,
      rating: firstService?.rating || 5.0,
      pendingRequests: 3,
    };

    return NextResponse.json({
      success: true,
      user,
      services: user.services, // ✅ Return the whole array
      stats,
      isSetupComplete,
      missingSteps: {
        service: !hasServiceDetails,
        verification: !hasVerification
      }
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}