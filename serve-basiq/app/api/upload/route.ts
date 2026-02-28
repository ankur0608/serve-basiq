
import { NextRequest, NextResponse } from "next/server";
import { generateR2UploadUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export async function POST(req: NextRequest) {
  try {
    console.log("---------------------------------------------------");
    console.log("🚀 [API] Presigned URL request received");

    // 🔒 TODO: Add Authentication check here so random people can't upload!

    // 1. Parse JSON instead of FormData. 
    const body = await req.json();
    const { filename, fileType, fileSize } = body;

    console.log("📦 [API] Payload received:", {
      filename,
      fileType,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`
    });

    if (!filename || !fileType || !fileSize) {
      console.warn("⚠️ [API] Missing file metadata in request.");
      return NextResponse.json({ success: false, message: "Missing file metadata" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

    // 2. Check if the file type is allowed
    if (!isImage && !isVideo) {
      console.warn("🚫 [API] Rejected: Invalid file type ->", fileType);
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only Images and Videos (MP4/WebM) are allowed." },
        { status: 415 }
      );
    }

    // 3. Apply conditional size limits based on the file type
    if (isImage && fileSize > MAX_IMAGE_SIZE) {
      console.warn("🚫 [API] Rejected: Image size exceeds 5MB.");
      return NextResponse.json(
        { success: false, message: "Image size exceeds the limit of 5MB." },
        { status: 413 }
      );
    }

    if (isVideo && fileSize > MAX_VIDEO_SIZE) {
      console.warn("🚫 [API] Rejected: Video size exceeds 50MB.");
      return NextResponse.json(
        { success: false, message: "Video size exceeds the limit of 50MB." },
        { status: 413 }
      );
    }

    console.log("✅ [API] Validation passed.");

    // 4. Generate the safe, unique key
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "");
    const uniqueId = randomUUID();
    const key = `services/${uniqueId}-${safeName}`;

    console.log(`⬆️ [API] Generating Presigned URL for key: ${key}`);

    // 5. Get the temporary URL from your updated lib/r2.ts
    const uploadUrl = await generateR2UploadUrl(key, fileType);
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

    console.log("🔗 [API] URL successfully generated!");
    console.log("🌐 [API] Future Public URL:", publicUrl);
    console.log("---------------------------------------------------");

    // 6. Return the URL to the client
    return NextResponse.json({
      success: true,
      key: key,
      uploadUrl: uploadUrl,
      publicUrl: publicUrl
    });

  } catch (error: any) {
    console.error("🔥 [API] Presigned URL Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}