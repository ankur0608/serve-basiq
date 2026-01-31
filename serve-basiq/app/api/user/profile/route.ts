import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/* =========================================================================
   GET: Fetch User & Flatten Data
   ========================================================================= */
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
        addresses: { take: 1, orderBy: { createdAt: 'desc' } },
        orders: { take: 1 },
        bookings: { take: 1 }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Flatten Address
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

      // Address Fields (Flattened)
      addressLine1: val(primaryAddress.line1),
      addressLine2: val(primaryAddress.line2),
      landmark: val(primaryAddress.landmark),
      city: val(primaryAddress.city),
      state: val(primaryAddress.state),
      pincode: val(primaryAddress.pincode),
      country: val(primaryAddress.country) || "India",

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