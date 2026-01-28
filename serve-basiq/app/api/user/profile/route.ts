import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/* ================= 1. GET PROFILE (FLATTENED) ================= */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch User with Relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        orders: { take: 1 },
        bookings: { take: 1 }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. 🔥 FLATTEN DATA
    const primaryAddress = user.addresses[0] || {};

    const flattenedUser = {
      ...user,
      dateOfBirth: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
      preferredLanguage: user.preferredLanguage || "English",

      // ✅ Explicit Address Mapping
      addressLine1: primaryAddress.line1 || "",
      addressLine2: primaryAddress.line2 || "", // Maps DB 'line2' to Frontend 'addressLine2'
      landmark: primaryAddress.landmark || "",
      city: primaryAddress.city || "",
      state: primaryAddress.state || "",
      pincode: primaryAddress.pincode || "",
      country: primaryAddress.country || "India",
    };

    return NextResponse.json(flattenedUser);

  } catch (error) {
    console.error("🔥 [API] Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* ================= 2. PATCH PROFILE (SAVE) ================= */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const {
      userId, name, email, phone, dateOfBirth, preferredLanguage,
      addressLine1, addressLine2, landmark, city, state, pincode, country,
    } = body;

    // @ts-ignore
    const sessionUserId = session.user.id;
    if (!userId || userId !== sessionUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Update User
    const userUpdateData: any = { name };
    if (email) userUpdateData.email = email;
    if (phone) userUpdateData.phone = phone;
    if (dateOfBirth) userUpdateData.dob = new Date(dateOfBirth);
    if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // 2. Update Address
    const addressData = {
      line1: addressLine1 || '',
      line2: addressLine2 || '', // ✅ Maps Frontend 'addressLine2' to DB 'line2'
      landmark: landmark || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India'
    };

    const existingAddress = await prisma.address.findFirst({ where: { userId } });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: addressData,
      });
    } else {
      if (addressLine1 || city || pincode) {
        await prisma.address.create({
          data: { userId, type: 'Home', ...addressData },
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 [API] Update Error:", error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}