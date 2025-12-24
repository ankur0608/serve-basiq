import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
    // 1. Get the auth params (signature, token, expire)
    const authenticationParameters = imagekit.getAuthenticationParameters();

    // 2. Return them PLUS the public key
    return NextResponse.json({
        ...authenticationParameters,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY, // <--- ADD THIS LINE
    });
}