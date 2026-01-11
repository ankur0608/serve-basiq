import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    // 🔍 LOG 1: Request Entry
    console.log("🚀 [API] Upload request hit");
    console.log(`   - Headers Content-Type: ${req.headers.get("content-type")}`);

    // Parse Form Data
    const formData = await req.formData();
    console.log("📦 [API] FormData parsed successfully");

    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ [API] Error: 'file' key missing in FormData");
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    // 🔍 LOG 2: File Inspection
    console.log("📂 [API] File Details Received:");
    console.log(`   - Name: ${file.name}`);
    console.log(`   - Size: ${file.size} bytes`);
    console.log(`   - Type: ${file.type}`);

    // Convert to Buffer
    console.log("🔄 [API] Converting file to ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ [API] Buffer created. Length: ${buffer.length}`);

    // Sanitize Key
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[()]/g, '');
    const key = `uploads/services/${Date.now()}-${sanitizedFileName}`;
    console.log(`🔑 [API] Generated R2 Key: ${key}`);

    // 🔍 LOG 3: R2 Handover
    console.log(`⬆️ [API] Calling uploadToR2 helper...`);
    const startTime = Date.now();

    // Call your R2 helper
    // Note: Ensure uploadToR2 returns the public URL or Key correctly
    const result = await uploadToR2(key, buffer, file.type);

    const duration = Date.now() - startTime;
    console.log(`⏱️ [API] R2 Upload operation took ${duration}ms`);

    // 🔍 LOG 4: Success & Response
    console.log("✅ [API] Upload successful. Result from helper:", result);

    // Depending on what your frontend expects, you might return just the key or the full URL
    // If uploadToR2 returns the full URL (as per your previous code), pass that back
    return NextResponse.json({
      success: true,
      key: key,
      url: result // sending the result from uploadToR2 back to frontend
    });

  } catch (error: any) {
    // 🔍 LOG 5: Critical Failure
    console.error("🔥 [API] CRITICAL UPLOAD FAILURE");
    console.error("   - Error Name:", error.name);
    console.error("   - Error Message:", error.message);
    console.error("   - Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}