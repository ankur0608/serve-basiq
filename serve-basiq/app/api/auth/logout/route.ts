import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // ✅ Fix: Await the cookies() call before deleting
    const cookieStore = await cookies();

    // Force delete NextAuth session cookies
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("__Host-next-auth.csrf-token");

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error logging out" }, { status: 500 });
  }
}