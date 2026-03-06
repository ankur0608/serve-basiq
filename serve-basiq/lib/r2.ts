import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateR2UploadUrl(key: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 });

    return signedUrl;

  } catch (error) {
    console.error("🔥 [R2] Presigned URL Error inside lib/r2.ts:", error);
    throw error;
  }
}