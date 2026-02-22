// import { NextRequest, NextResponse } from "next/server";
// import { uploadToR2 } from "@/lib/r2";

// // --- CONFIGURATION ---
// const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2 MB Limit (Post-compression)
// const ALLOWED_MIME_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "image/jpg"
// ];

// export async function POST(req: NextRequest) {
//   try {
//     console.log("🚀 [API] Upload request received");

//     // 1. Parse FormData
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { success: false, message: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // 🔍 Log image size
//     const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
//     console.log(`📏 [API] Image Size: ${file.size} bytes (${fileSizeInMB} MB)`);

//     // 2. 🛡️ STRICT VALIDATION: File Size
//     if (file.size > MAX_UPLOAD_SIZE) {
//       console.warn(
//         `⚠️ [API] File too large: ${file.size} bytes (${fileSizeInMB} MB)`
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           message: `File size exceeds the limit of ${MAX_UPLOAD_SIZE / (1024 * 1024)
//             }MB. Please compress your image.`
//         },
//         { status: 413 }
//       );
//     }

//     // 3. 🛡️ STRICT VALIDATION: File Type
//     if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//       console.warn(`⚠️ [API] Invalid MIME type: ${file.type}`);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid file type. Only JPEG, PNG, and WebP are allowed."
//         },
//         { status: 415 }
//       );
//     }

//     console.log(
//       `📂 [API] Processing: ${file.name} (${file.size} bytes | ${fileSizeInMB} MB)`
//     );

//     // 4. Convert & Upload
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Sanitize filename
//     const timestamp = Date.now();
//     const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
//     const key = `uploads/services/${timestamp}-${safeName}`;

//     console.log(`⬆️ [API] Uploading to R2: ${key}`);
//     console.log(`📦 [API] Final Upload Size: ${buffer.length} bytes`);

//     const url = await uploadToR2(key, buffer, file.type);

//     console.log("✅ [API] Upload success");

//     return NextResponse.json({
//       success: true,
//       key: key,
//       url: url
//     });

//   } catch (error: any) {
//     console.error("🔥 [API] Upload Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal Server Error during file upload",
//         debug:
//           process.env.NODE_ENV === "development"
//             ? error.message
//             : undefined
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "video/mp4", 
  "video/webm"  
];

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 [API] Upload request received");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the limit of ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB.`
        },
        { status: 413 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only Images and Videos (MP4/WebM) are allowed."
        },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");

    const key = `services/${timestamp}-${safeName}`;

    console.log(`⬆️ [API] Uploading to R2: ${key}`);

    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      key: key,
      url: url
    });

  } catch (error: any) {
    console.error("🔥 [API] Upload Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}