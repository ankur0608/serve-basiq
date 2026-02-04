import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 🔍 DEBUG: Log environment variables to verify they are loaded
console.log("---------------------------------------------------");
console.log("🔧 [R2 Config Debug]");
console.log("🆔 Account ID:", process.env.R2_ACCOUNT_ID ? "Loaded ✅" : "Missing ❌");
console.log("🔑 Access Key ID:", process.env.R2_ACCESS_KEY_ID ? "Loaded ✅" : "Missing ❌");
console.log("🔒 Secret Key Length:", process.env.R2_SECRET_ACCESS_KEY ? process.env.R2_SECRET_ACCESS_KEY.length : 0);
console.log("📦 Bucket Name:", process.env.R2_BUCKET);
console.log("🌐 Public URL:", process.env.R2_PUBLIC_BASE_URL);
console.log("🔗 Constructed Endpoint:", `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
console.log("---------------------------------------------------");

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  key: string,
  file: Buffer,
  contentType: string
) {
  try {
    console.log(`⬆️ [R2] Starting upload for key: ${key}`);

    await R2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: file,
        ContentType: contentType,
        // Note: R2 usually ignores ACLs, but keeping it if your bucket requires it
        ACL: "public-read",
      })
    );

    console.log(`✅ [R2] Upload complete: ${key}`);
    return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

  } catch (error) {
    console.error("🔥 [R2] Upload Error inside lib/r2.ts:", error);
    throw error;
  }
}