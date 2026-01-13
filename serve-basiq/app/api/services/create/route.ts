import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

// Helper to ensure URLs are valid (fixes your previous error too)
const ensureProtocol = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🚀 [API] Service Create/Update Received:", JSON.stringify(body, null, 2));

    const { userId, serviceId, ...formData } = body;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Auto-fix URLs before validation
    formData.instagramUrl = ensureProtocol(formData.instagramUrl);
    formData.facebookUrl = ensureProtocol(formData.facebookUrl);
    formData.websiteUrl = ensureProtocol(formData.websiteUrl);
    formData.youtubeUrl = ensureProtocol(formData.youtubeUrl);

    // 2. Validate data
    const data = serviceSettingsSchema.parse(formData);

    // 3. Prepare Payload (FIXED MAPPING HERE)
    const payload = {
      name: data.name,
      desc: data.desc,

      // ⚠️ CRITICAL FIX: Mapping 'serviceimg' correctly for Prisma
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

      // Address
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

      // Socials
      instagramUrl: formData.instagramUrl,
      facebookUrl: formData.facebookUrl,
      websiteUrl: formData.websiteUrl,
      youtubeUrl: formData.youtubeUrl,

      // Gallery (Optional, depending on schema)
      gallery: formData.gallery || [],
    };

    console.log("🛠️ [API] Sending payload to Prisma:", payload);

    let result;

    if (serviceId) {
      // Update
      console.log(`🔄 [API] Updating Service ID: ${serviceId}`);
      result = await prisma.service.update({
        where: { id: serviceId }, // Ensure ID is string/number based on schema
        data: payload,
      });
    } else {
      // Create
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
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}