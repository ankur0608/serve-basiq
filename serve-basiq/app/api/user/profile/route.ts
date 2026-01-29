import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic to ensure data is always fresh
export const dynamic = 'force-dynamic';

/* =========================================================================
   1. GET PROFILE (Fetches User & Flattens Address Data)
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
        addresses: { take: 1, orderBy: { createdAt: 'desc' } }, // Get latest address
        orders: { take: 1 },
        bookings: { take: 1 }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const primaryAddress = user.addresses[0] || {};

    // Flatten the data structure for easier frontend consumption
    const flattenedUser = {
      ...user,
      dateOfBirth: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
      preferredLanguage: user.preferredLanguage || "English",
      addressLine1: primaryAddress.line1 || "",
      addressLine2: primaryAddress.line2 || "",
      landmark: primaryAddress.landmark || "",
      city: primaryAddress.city || "",
      state: primaryAddress.state || "",
      pincode: primaryAddress.pincode || "",
      country: primaryAddress.country || "India",
    };

    return NextResponse.json(flattenedUser);
  } catch (error) {
    console.error("🔥 [API] GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* =========================================================================
   2. MULTI-ACTION POST (Handles Specific Updates like Name or Provider Type)
   ========================================================================= */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Destructure all possible fields needed for actions
    const { action, userId, name, providerType } = body;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security check: Ensure the session user matches the requested userId
    // @ts-ignore
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case "UPDATE_NAME":
        if (!name || name.trim().length < 2) {
          return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }
        const updatedNameUser = await prisma.user.update({
          where: { id: userId },
          data: { name: name.trim() },
        });
        return NextResponse.json({ success: true, user: updatedNameUser });

      // ✅ NEW CASE: Update Provider Type (SERVICE, PRODUCT, or BOTH)
      case "UPDATE_PROVIDER_TYPE":
        if (!providerType) {
          return NextResponse.json({ error: 'Provider Type is required' }, { status: 400 });
        }

        // Validate against enum if necessary, or let Prisma handle the error
        const userWithNewType = await prisma.user.update({
          where: { id: userId },
          data: { providerType: providerType }
        });

        return NextResponse.json({ success: true, user: userWithNewType });

      case "SECONDARY_ACTION":
        // Placeholder for other specific actions
        return NextResponse.json({ success: true, message: "Secondary action complete" });

      default:
        return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
    }
  } catch (error: any) {
    console.error("🔥 [API] POST Error:", error);
    return NextResponse.json({ error: error.message || 'Post failed' }, { status: 500 });
  }
}

/* =========================================================================
   3. PATCH PROFILE (Full Profile Save - Personal Info & Address)
   ========================================================================= */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId, name, email, phone, dateOfBirth, preferredLanguage,
      addressLine1, addressLine2, landmark, city, state, pincode, country,
    } = body;

    // @ts-ignore
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare User update object
    const userUpdateData: any = { name };
    if (email) userUpdateData.email = email;
    if (phone) userUpdateData.phone = phone;
    if (dateOfBirth) userUpdateData.dob = new Date(dateOfBirth);
    if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

    // Update User Table
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    // Prepare Address update object
    const addressData = {
      line1: addressLine1 || '',
      line2: addressLine2 || '',
      landmark: landmark || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India'
    };

    // Update or Create Address
    const existingAddress = await prisma.address.findFirst({ where: { userId } });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: addressData
      });
    } else if (addressLine1 || city || pincode) {
      // Only create if there is some address data provided
      await prisma.address.create({
        data: { userId, type: 'Home', ...addressData }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🔥 [API] PATCH Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}