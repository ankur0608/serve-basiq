import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // ✅ FIX: Removed 'take: 1' so we get ALL addresses
        addresses: { orderBy: { createdAt: 'desc' } },
        orders: { take: 1 },
        bookings: { take: 1 }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Flatten Address (keep primary address logic for backward compatibility with profile forms)
    const primaryAddress = user.addresses[0] || {};

    // Helper: convert null/undefined to empty string for React Inputs
    const val = (v: any) => (v === null || v === undefined ? "" : v);

    // Format DOB
    const formattedDob = user.dob
      ? new Date(user.dob).toISOString().split('T')[0]
      : "";

    // ✅ Construct the "Perfect" Response
    const finalUserData = {
      // Basic Info
      id: user.id,
      name: val(user.name),
      email: val(user.email),
      phone: val(user.phone),

      // Images
      img: val(user.image),
      profileImage: val(user.image),

      // Profile Details
      dob: formattedDob,
      dateOfBirth: formattedDob,
      preferredLanguage: val(user.preferredLanguage) || "English",

      // Roles
      role: user.role,
      providerType: user.providerType,
      isWorker: user.isWorker,
      isPhoneVerified: user.isPhoneVerified,
      // Address Fields (Flattened - mostly for Profile Edit Form)
      addressLine1: val(primaryAddress.line1),
      addressLine2: val(primaryAddress.line2),
      landmark: val(primaryAddress.landmark),
      city: val(primaryAddress.city),
      state: val(primaryAddress.state),
      pincode: val(primaryAddress.pincode),
      country: val(primaryAddress.country) || "India",

      // ✅ CRITICAL: Return the FULL array of addresses for the Booking Modal
      addresses: user.addresses,

      // ✅ Flag for Frontend Logic
      isFullProfile: true
    };

    return NextResponse.json(finalUserData);

  } catch (error) {
    console.error("🔥 [API] GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


/* =========================================================================
   PATCH: Update User & Address
   ========================================================================= */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    // @ts-ignore
    const userId = session.user.id;

    // Destructure everything
    const {
      name, email, phone, dateOfBirth, dob, preferredLanguage, profileImage, image,
      addressLine1, addressLine2, landmark, city, state, pincode, country
    } = body;

    // 1. Prepare User Data
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email;
    if (phone) userUpdateData.phone = phone;
    if (profileImage || image) userUpdateData.image = profileImage || image;

    const dobValue = dateOfBirth || dob;
    if (dobValue) userUpdateData.dob = new Date(dobValue);
    if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: userUpdateData });
    }

    // 2. Prepare Address Data
    const hasAddressData = addressLine1 || city || state || pincode;
    if (hasAddressData) {
      const addressData = {
        line1: addressLine1 || '',
        line2: addressLine2 || '',
        landmark: landmark || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        country: country || 'India'
      };

      const existingAddress = await prisma.address.findFirst({ where: { userId } });

      if (existingAddress) {
        await prisma.address.update({ where: { id: existingAddress.id }, data: addressData });
      } else {
        await prisma.address.create({ data: { userId, type: 'Home', ...addressData } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🔥 [API] PATCH Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// ... existing imports

/* =========================================================================
   POST: Handle Specific Actions (like UPDATE_NAME)
   ========================================================================= */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, userId: bodyUserId } = body;

    // Security check: Ensure the session user matches the requested update
    // @ts-ignore
    const sessionUserId = session.user.id;
    if (sessionUserId !== bodyUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ⚡ Handle the UPDATE_NAME action sent by your NameModal
    if (action === "UPDATE_NAME") {
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: sessionUserId },
        data: { name: name.trim() },
      });

      return NextResponse.json({ success: true, message: "Name updated" });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error("🔥 [API] POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

