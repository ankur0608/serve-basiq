
// import { NextRequest, NextResponse } from "next/server";
// import { generateR2UploadUrl } from "@/lib/r2";
// import { randomUUID } from "crypto";

// const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
// const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
// const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, fileType, fileSize } = body;


//     if (!filename || !fileType || !fileSize) {
//       console.warn("⚠️ [API] Missing file metadata in request.");
//       return NextResponse.json({ success: false, message: "Missing file metadata" }, { status: 400 });
//     }

//     const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
//     const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

//     if (!isImage && !isVideo) {
//       console.warn("🚫 [API] Rejected: Invalid file type ->", fileType);
//       return NextResponse.json(
//         { success: false, message: "Invalid file type. Only Images and Videos (MP4/WebM) are allowed." },
//         { status: 415 }
//       );
//     }

//     if (isImage && fileSize > MAX_IMAGE_SIZE) {
//       console.warn("🚫 [API] Rejected: Image size exceeds 5MB.");
//       return NextResponse.json(
//         { success: false, message: "Image size exceeds the limit of 5MB." },
//         { status: 413 }
//       );
//     }

//     if (isVideo && fileSize > MAX_VIDEO_SIZE) {
//       console.warn("🚫 [API] Rejected: Video size exceeds 50MB.");
//       return NextResponse.json(
//         { success: false, message: "Video size exceeds the limit of 50MB." },
//         { status: 413 }
//       );
//     }

//     const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "");
//     const uniqueId = randomUUID();
//     const key = `services/${uniqueId}-${safeName}`;

//     const uploadUrl = await generateR2UploadUrl(key, fileType);
//     const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

//     return NextResponse.json({
//       success: true,
//       key: key,
//       uploadUrl: uploadUrl,
//       publicUrl: publicUrl
//     });

//   } catch (error: any) {
//     console.error("🔥 [API] Presigned URL Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { generateR2UploadUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_FOLDERS = ["users", "rentals", "products", "services", "reviews"];

export async function POST(req: NextRequest) {
  // ⏱️ START THE TIMER
  const startTime = performance.now();

  try {
    const body = await req.json();
    const { filename, fileType, fileSize, folder } = body;

    if (!filename || !fileType || !fileSize) {
      return NextResponse.json({ success: false, message: "Missing metadata" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

    if (!isImage && !isVideo) {
      return NextResponse.json({ success: false, message: "Invalid file type." }, { status: 415 });
    }

    if (isImage && fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, message: "Image exceeds 5MB." }, { status: 413 });
    }

    if (isVideo && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json({ success: false, message: "Video exceeds 50MB." }, { status: 413 });
    }

    const targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "misc";
    const subfolder = isVideo ? "videos" : "images";
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "");
    const uniqueId = randomUUID();
    const key = `${targetFolder}/${subfolder}/${uniqueId}-${safeName}`;

    const uploadUrl = await generateR2UploadUrl(key, fileType);
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

    // ⏱️ STOP THE TIMER
    const endTime = performance.now();
    console.log(`⚡ [API] Presigned URL generated in ${(endTime - startTime).toFixed(2)}ms for ${filename}`);

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