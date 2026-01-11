import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: true,
        addresses: true,
      },
    });

    if (!user) throw new Error("User not found");

    // --- Verification Check ---
    // We check if the user has submitted their verification details.
    // Ideally, check the 'verificationStatus' flag you set in the previous step.
    const isProfileSubmitted = user.verificationStatus === "SUBMITTED" || user.verificationStatus === "APPROVED";

    // Fallback check: Do they have the critical fields?
    const hasCriticalFields = !!(
      user.bankAccountNumber &&
      user.idProofImg
    );

    // ✅ UPDATED LOGIC: 
    // Unlock dashboard if status is SUBMITTED/APPROVED OR if fields exist.
    const isSetupComplete = isProfileSubmitted || hasCriticalFields;

    const stats = {
      revenue: 1250,
      jobsCompleted: 14,
      rating: 5.0, // Default rating
      pendingRequests: 3,
    };

    return NextResponse.json({
      success: true,
      user,
      services: user.services,
      stats,
      isSetupComplete, // This drives the modal visibility
      missingSteps: {
        verification: !isSetupComplete
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}