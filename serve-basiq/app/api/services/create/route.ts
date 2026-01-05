import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔍 LOG 1: See exactly what the frontend sent
    console.log("🚀 [API] Service Create/Update Received:", JSON.stringify(body, null, 2));

    const { userId, serviceId, ...formData } = body;

    if (!userId) {
      console.error("❌ [API] Error: Missing userId");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate data
    const data = serviceSettingsSchema.parse(formData);

    // 🔍 LOG 2: Confirm validation passed
    console.log("✅ [API] Zod Validation Passed");

    // Prepare payload (convert numbers, etc.)
    const payload = {
      name: data.name,
      desc: data.desc,
      price: data.price,
      experience: data.experience,
      altPhone: data.altPhone,

      // ✅ FIX: Convert empty string to null to avoid Foreign Key crashes
      categoryId: data.categoryId === "" ? null : data.categoryId,

      subCategoryIds: data.subCategoryIds,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      radiusKm: data.radiusKm,
      workingDays: data.workingDays,
      openTime: data.openTime,
      closeTime: data.closeTime,
    };

    // 🔍 LOG 3: Check the final object before sending to Prisma
    console.log("🛠️ [API] Sending to Prisma:", payload);

    let result;

    if (serviceId) {
      // ✅ UPDATE
      console.log(`🔄 [API] Updating Service ID: ${serviceId}`);
      result = await prisma.service.update({
        where: { id: Number(serviceId) },
        data: payload,
      });
    } else {
      // ✅ CREATE
      console.log(`✨ [API] Creating NEW Service for User: ${userId}`);
      result = await prisma.service.create({
        data: {
          userId, // Link to the user
          ...payload,
          isVerified: false,
          rating: 5.0,
          img: "",
        },
      });
    }

    // 🔍 LOG 4: Success
    console.log("🎉 [API] Success! Service ID:", result.id);

    return NextResponse.json({ success: true, service: result });

  } catch (error: any) {
    // 🔍 LOG 5: Catch and print any errors
    console.error("🔥 [API] Service API Error Details:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}