import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...formData } = body;
    
    // Validate
    const data = serviceSettingsSchema.parse(formData);

    await prisma.service.update({
      where: { userId },
      data: {
        categoryId: data.categoryId,
        radiusKm: data.radiusKm,
        addressLine1: data.addressLine1,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        workingDays: data.workingDays,
        openTime: data.openTime,
        closeTime: data.closeTime,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}