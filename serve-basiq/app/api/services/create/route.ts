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

    // Validate data using Zod
    const data = serviceSettingsSchema.parse(formData);

    // 🔍 LOG 2: Validation passed
    console.log("✅ [API] Zod Validation Passed");

    // Prepare payload 
    // ⚠️ FIX: No need to use parseFloat/parseInt because 'data' fields are already numbers from Zod
    const payload = {
      name: data.name,
      desc: data.desc,

      // Media Fields
      img: data.mainimg || data.img || "",
      mainimg: data.mainimg,
      coverImg: data.coverImg,

      // Pricing & Experience (Already numbers)
      price: data.price,
      priceType: data.priceType || "FIXED",
      experience: data.experience ?? null,

      altPhone: data.altPhone,

      // Categories
      categoryId: data.categoryId === "" ? null : data.categoryId,
      subCategoryIds: data.subCategoryIds,

      // Location
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,

      // Geo (Already numbers)
      latitude: data.latitude,
      longitude: data.longitude,
      radiusKm: data.radiusKm ?? 10,

      // Availability
      workingDays: data.workingDays,
      openTime: data.openTime,
      closeTime: data.closeTime,
    };

    // 🔍 LOG 3: Check the final object before sending to Prisma
    console.log("🛠️ [API] Sending payload to Prisma:", payload);

    let result;

    if (serviceId) {
      // ✅ UPDATE EXISTING SERVICE
      console.log(`🔄 [API] Updating Service ID: ${serviceId}`);
      result = await prisma.service.update({
        where: { id: Number(serviceId) },
        data: payload,
      });
    } else {
      // ✅ CREATE NEW SERVICE
      console.log(`✨ [API] Creating NEW Service for User: ${userId}`);
      result = await prisma.service.create({
        data: {
          userId,
          ...payload,
          isVerified: false,
          rating: 5.0,
          img: payload.img || "",
        },
      });
    }

    // 🔍 LOG 4: Success
    console.log("🎉 [API] Success! Service ID:", result.id);

    return NextResponse.json({ success: true, service: result });

  } catch (error: any) {
    // 🔍 LOG 5: Catch and print any errors
    console.error("🔥 [API] Service API Error Details:", error);

    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "Unique constraint violation" }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}