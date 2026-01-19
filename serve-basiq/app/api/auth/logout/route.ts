import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // List of all NextAuth cookies to destroy
    const cookiesToDelete = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
      "next-auth.state",
      "__Secure-next-auth.state"
    ];

    // Destroy cookies by expiring them immediately
    cookiesToDelete.forEach((cookieName) => {
      cookieStore.set(cookieName, "", { maxAge: 0, path: "/" });
    });

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    // Return 200 anyway so client doesn't freeze
    return NextResponse.json({ message: "Logout processed" }, { status: 200 });
  }
}