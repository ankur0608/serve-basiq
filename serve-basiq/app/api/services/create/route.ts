import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...formData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 1. Validate Data (Zod handles type coercion checks)
    const data = serviceSettingsSchema.parse(formData);

    // 2. Update Service in DB
    // We use 'update' because the skeleton service was created in Onboarding
    const updatedService = await prisma.service.update({
      where: { userId: userId },
      data: {
        categoryId: data.categoryId,
        subCategoryIds: data.subCategoryIds || [],

        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || "",
        city: data.city,
        state: data.state,
        pincode: data.pincode,

        latitude: data.latitude,
        longitude: data.longitude,
        radiusKm: data.radiusKm,

        workingDays: data.workingDays, // Prisma handles String[] automatically
        openTime: data.openTime,
        closeTime: data.closeTime,
      },
    });

    return NextResponse.json({ success: true, service: updatedService });

  } catch (error: any) {
    console.error("Service Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.issues ? "Invalid Data" : error.message },
      { status: 400 }
    );
  }
}