// Load environment variables manually
require('dotenv').config(); 
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

console.log("-----------------------------------------");
console.log("🧪 R2 CREDENTIALS TEST");
console.log("-----------------------------------------");
console.log("Account ID:", process.env.R2_ACCOUNT_ID);
console.log("Access Key:", process.env.R2_ACCESS_KEY_ID?.substring(0, 5) + "...");
console.log("Secret Len:", process.env.R2_SECRET_ACCESS_KEY?.length);
console.log("Bucket:    ", process.env.R2_BUCKET);
console.log("-----------------------------------------");

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  try {
    console.log("⏳ Attempting upload...");
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: "test-file.txt",
      Body: "This is a test file from the standalone script.",
      ContentType: "text/plain",
    });

    await R2.send(cmd);
    console.log("✅ SUCCESS! Your keys are working.");
    console.log("👉 If this works, restart your Next.js server with 'npm run dev'");
  } catch (error) {
    console.error("❌ FAILURE:");
    console.error(error.name);
    console.error(error.message);
    if (error.name === "InvalidAccessKeyId" || error.name === "SignatureDoesNotMatch" || error.message.includes("Unauthorized")) {
        console.log("\n⚠️  DIAGNOSIS: Your Keys or Permissions are wrong.");
        console.log("1. Go to Cloudflare > R2 > Manage API Tokens");
        console.log("2. Delete the old token.");
        console.log("3. Create NEW Token -> Permissions: **Object Read & Write**");
        console.log("4. Update .env with the new Access Key ID and Secret Access Key.");
    }
  }
}

run();