// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// const R2 = new S3Client({
//   region: "auto",
//   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   forcePathStyle: true,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
//   },
// });

// export async function generateR2UploadUrl(key: string, contentType: string) {
//   try {
//     const command = new PutObjectCommand({
//       Bucket: process.env.R2_BUCKET!,
//       Key: key,
//       ContentType: contentType,
//     });

//     const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 });

//     return signedUrl;

//   } catch (error) {
//     console.error("🔥 [R2] Presigned URL Error inside lib/r2.ts:", error);
//     throw error;
//   }
// }

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateR2UploadUrl(key: string, contentType: string) {
  try {
    console.log(`⏳ [R2] Generating presigned URL for key: "${key}" (${contentType})...`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 });

    console.log(`✅ [R2] Successfully generated presigned URL for: "${key}"`);
    return signedUrl;

  } catch (error) {
    console.error("🔥 [R2] Presigned URL Error inside lib/r2.ts:", error);
    throw error;
  }
}

/**
 * Helper to extract the R2 Object Key from a full public URL.
 * Example: "https://pub-xxx.r2.dev/images/my-pic.jpg" -> "images/my-pic.jpg"
 */
function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // Removes the leading slash to get the exact R2 key
    const extractedKey = urlObj.pathname.substring(1);
    console.log(`🔍 [R2] Extracted key: "${extractedKey}" from URL: "${url}"`);
    return extractedKey;
  } catch (error) {
    // If it's not a valid URL, assume it might already be a raw key
    console.log(`⚠️ [R2] Could not parse URL, assuming raw key: "${url}"`);
    return url;
  }
}

/**
 * Deletes multiple files from the R2 bucket.
 */
export async function deleteR2Files(urls: string[]) {
  console.log(`🗑️ [R2] deleteR2Files called with raw URLs:`, urls);

  try {
    // 1. Extract valid keys and remove nulls/duplicates
    const keys = Array.from(new Set(urls.map(extractKeyFromUrl).filter(Boolean))) as string[];

    console.log(`📋 [R2] Final unique keys to delete:`, keys);

    if (keys.length === 0) {
      console.log(`⏭️ [R2] No valid keys found. Skipping deletion.`);
      return;
    }

    // 2. Batch delete objects using DeleteObjectsCommand
    console.log(`⏳ [R2] Sending DeleteObjectsCommand to bucket: ${process.env.R2_BUCKET!}...`);
    const command = new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET!,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false, // Set to true if you don't want detailed error reports from R2
      },
    });

    await R2.send(command);
    console.log("✅ [R2] Successfully deleted files:", keys);
  } catch (error) {
    console.error("🔥 [R2] Delete Error:", error);
    // We don't throw here so that the DB deletion can still proceed 
    // even if an image is already missing from the bucket.
  }
}