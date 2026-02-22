import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export async function GET() {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
    });

    if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
      throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT env variable");
    }

    const authenticationParameters = imagekit.getAuthenticationParameters();

    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error.message);
    return NextResponse.json(
      { error: "ImageKit Auth Failed", details: error.message },
      { status: 500 }
    );
  }
}

// export async function GET() {
//     // 1. Get the auth params (signature, token, expire)
//     const authenticationParameters = imagekit.getAuthenticationParameters();

//     // 2. Return them PLUS the public key
//     return NextResponse.json({
//         ...authenticationParameters,
//         publicKey: process.env.IMAGEKIT_PUBLIC_KEY, // <--- ADD THIS LINE
//     });
// }
// // import { NextRequest, NextResponse } from "next/server";
// import { uploadToR2 } from "@/lib/r2";

// export async function POST(req: NextRequest) {
//   const form = await req.formData();
//   const file = form.get("file") as File;

//   if (!file) {
//     return NextResponse.json({ error: "File missing" }, { status: 400 });
//   }

//   const bytes = Buffer.from(await file.arrayBuffer());
//   const key = `uploads/${Date.now()}-${file.name}`;

//   const url = await uploadToR2(key, bytes, file.type);

//   return NextResponse.json({ key, r2Url: url });
// }
