import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { service: true },
    });

    if (!user) throw new Error("User not found");

    // LOGIC: Check if profile is complete
    // 1. Service Details (Category + Location)
    const hasServiceDetails = !!(
      user.service?.categoryId &&
      user.service?.latitude &&
      user.service?.workingDays.length > 0
    );

    // 2. Verification Details (Bank + ID)
    const hasVerification = !!(
      user.bankAccountNumber &&
      user.idProofImg
    );

    const isSetupComplete = hasServiceDetails && hasVerification;

    // Mock Stats
    const stats = {
      revenue: 1250,
      jobsCompleted: 14,
      rating: user.service?.rating || 5.0,
      pendingRequests: 3,
    };

    return NextResponse.json({
      success: true,
      user,
      service: user.service,
      stats,
      isSetupComplete, // <--- Crucial Flag
      missingSteps: {
        service: !hasServiceDetails,
        verification: !hasVerification
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}