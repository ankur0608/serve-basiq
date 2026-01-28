import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/* ================= 1. GET PROFILE (SECURE) ================= */
export async function GET(request: Request) {
  try {
    console.log("🚀 [API] GET Profile Started");

    // 1. ✅ GET SESSION
    const session = await getServerSession(authOptions);

    // 🔴 FIX: Removed the check for ".email"
    // We now just check if 'session.user' exists.
    if (!session || !session.user) {
      console.log("❌ [API] Unauthorized: No session found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. ✅ USE SESSION ID
    // We cast to 'any' because TypeScript might complain about custom fields like 'id'
    const userId = (session.user as any).id;

    console.log("👤 [API] Fetching data for User ID:", userId);

    if (!userId) {
      console.log("❌ [API] Unauthorized: No User ID in session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Search for user by ID
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        addresses: true,
        orders: {
          include: {
            product: {
              select: {
                name: true,
                productImage: true,
                user: { select: { shopName: true, name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        bookings: {
          include: {
            service: {
              select: {
                name: true,
                mainimg: true,
                user: { select: { name: true, shopName: true } },
                price: true,
                priceType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!user) {
      console.log("❌ [API] User not found in DB");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("✅ [API] Profile Fetched Successfully");
    return NextResponse.json(user);

  } catch (error) {
    console.error("🔥 [API] Profile Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
/* ================= 2. UPDATE PROFILE (SECURE) ================= */
export async function POST(request: Request) {
  try {
    console.log("🚀 [API] POST Profile Update Started");

    // 1. ✅ Check Session
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("❌ [API] Unauthorized: No session found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log("📦 [API] Update Payload:", body);

    const {
      userId,
      name,
      email,
      phone,
      dateOfBirth,
      preferredLanguage,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      country,
    } = body;

    // 2. ✅ Security Check: Ensure User is updating THEIR OWN profile
    const sessionUserId = (session.user as any).id;
    if (!userId || userId !== sessionUserId) {
      console.log("⚠️ [API] Forbidden: User ID mismatch", { requested: userId, session: sessionUserId });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userUpdateData: any = { name };

    if (email && email.trim() !== "") userUpdateData.email = email;
    if (phone && phone.trim() !== "") userUpdateData.phone = phone;

    if (dateOfBirth) userUpdateData.dob = new Date(dateOfBirth);
    if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

    // 3. Update User
    console.log("🔄 [API] Updating User Info...");
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // 4. Update Address
    console.log("🔄 [API] Updating Address Info...");
    const existingAddress = await prisma.address.findFirst({ where: { userId } });

    const addressData = {
      line1: addressLine1 || '',
      line2: addressLine2 || '',
      landmark: landmark || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India'
    };

    if (existingAddress) {
      console.log("📝 [API] Updating existing address:", existingAddress.id);
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: addressData,
      });
    } else {
      if (addressLine1 || city || pincode) {
        console.log("✨ [API] Creating new address record");
        await prisma.address.create({
          data: { userId, type: 'Home', ...addressData },
        });
      }
    }

    // 5. Return Updated User
    console.log("🔍 [API] Fetching updated profile to return...");
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: true,
        bookings: true
      },
    });

    console.log("✅ [API] Profile Update Complete");
    return NextResponse.json(finalUser);

  } catch (error: any) {
    console.error("🔥 [API] Update Error:", error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}