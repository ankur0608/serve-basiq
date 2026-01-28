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

    // 1. Validate data
    const data = serviceSettingsSchema.parse(formData);

    // 2. Prepare Base Payload
    // ❌ REMOVED: subCategoryIds (we handle this separately below)
    const basePayload = {
      name: data.name,
      desc: data.desc,

      serviceimg: formData.serviceimg || data.mainimg || "",
      mainimg: data.mainimg,
      coverImg: data.coverImg,

      price: data.price,
      priceType: data.priceType || "FIXED",
      experience: data.experience ?? null,
      altPhone: data.altPhone,

      // If categoryId is a direct column in your database, this is fine.
      // If it's strictly a relation, you might need { category: { connect: { id: data.categoryId } } }
      // But usually passing the ID directly works if the column exists.
      categoryId: data.categoryId === "" ? null : data.categoryId,

      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,

      latitude: data.latitude,
      longitude: data.longitude,
      radiusKm: data.radiusKm ?? 10,

      workingDays: data.workingDays,
      openTime: data.openTime,
      closeTime: data.closeTime,

      gallery: formData.gallery || [],
    };

    // 3. Prepare Subcategory Logic
    // Prisma expects [{ id: "123" }, { id: "456" }]
    const subCategoriesConnect = data.subCategoryIds && data.subCategoryIds.length > 0
      ? data.subCategoryIds.map((id) => ({ id }))
      : [];

    console.log("🛠️ [API] Sending payload to Prisma...");

    let result;

    if (serviceId) {
      // --- UPDATE EXISTING SERVICE ---
      console.log(`🔄 [API] Updating Service ID: ${serviceId}`);
      result = await prisma.service.update({
        where: { id: serviceId },
        data: {
          ...basePayload,
          // ✅ USE 'set': Replaces all existing subcategories with the new list
          subcategories: {
            set: subCategoriesConnect,
          },
        },
      });
    } else {
      // --- CREATE NEW SERVICE ---
      console.log(`✨ [API] Creating NEW Service for User: ${userId}`);
      result = await prisma.service.create({
        data: {
          userId,
          ...basePayload,
          isVerified: false,
          rating: 5.0,
          // ✅ USE 'connect': Links these subcategories to the new service
          subcategories: {
            connect: subCategoriesConnect,
          },
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