import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🚀 [API] Service Create/Update Received:", JSON.stringify(body, null, 2));

    const { userId, serviceId, ...formData } = body;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Validate data (Socials removed from validation logic if they are in schema, otherwise ignored)
    const data = serviceSettingsSchema.parse(formData);

    // 2. Prepare Payload
    // We REMOVED social links from here because they are now part of the User Profile / Verification
    const payload = {
      name: data.name,
      desc: data.desc,

      // ⚠️ Mapping 'serviceimg' correctly
      serviceimg: formData.serviceimg || data.mainimg || "",
      mainimg: data.mainimg,
      coverImg: data.coverImg,

      // Numbers
      price: data.price,
      priceType: data.priceType || "FIXED",
      experience: data.experience ?? null,
      altPhone: data.altPhone,

      // Categories
      categoryId: data.categoryId === "" ? null : data.categoryId,
      subCategoryIds: data.subCategoryIds,

      // Address (Service Location)
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,

      // Geo
      latitude: data.latitude,
      longitude: data.longitude,
      radiusKm: data.radiusKm ?? 10,

      // Availability
      workingDays: data.workingDays,
      openTime: data.openTime,
      closeTime: data.closeTime,

      // Gallery
      gallery: formData.gallery || [],
    };

    console.log("🛠️ [API] Sending payload to Prisma:", payload);

    let result;

    if (serviceId) {
      // Update Existing Service
      console.log(`🔄 [API] Updating Service ID: ${serviceId}`);
      result = await prisma.service.update({
        where: { id: serviceId },
        data: payload,
      });
    } else {
      // Create New Service
      console.log(`✨ [API] Creating NEW Service for User: ${userId}`);
      result = await prisma.service.create({
        data: {
          userId,
          ...payload,
          isVerified: false,
          rating: 5.0,
        },
      });
    }

    console.log("🎉 [API] Success! Service ID:", result.id);
    return NextResponse.json({ success: true, service: result });

  } catch (error: any) {
    console.error("🔥 [API] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server Error" },
      { status: 500 }
    );
  }
}