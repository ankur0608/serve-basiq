import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/* ================= 1. GET PROFILE (Fetches Data) ================= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    // Search for user by ID, Email, OR Phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier },
          { phone: identifier }
        ]
      },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* ================= 2. UPDATE PROFILE (Saves Data) ================= */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🔍 DEBUG LOGS
    console.log("📥 [API] Profile Update Body:", body);

    const {
      userId,
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      country,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare User Update Data
    const userUpdateData: any = { name };

    // Only update email/phone if they are not empty
    if (email && email.trim() !== "") userUpdateData.email = email;
    if (phone && phone.trim() !== "") userUpdateData.phone = phone;

    console.log("⚙️ [API] Prisma User Update Data:", userUpdateData);

    // 1. Update User Details
    try {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    } catch (error) {
      console.error("❌ [API] Prisma Update Error:", error);

      // Handle Unique Constraint Violation (Duplicate Email/Phone)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          if (Array.isArray(target) && target.includes('email')) {
            return NextResponse.json({ error: 'This email is already taken by another user.' }, { status: 409 });
          }
          if (Array.isArray(target) && target.includes('phone')) {
            return NextResponse.json({ error: 'This phone number is already linked to another account.' }, { status: 409 });
          }
          return NextResponse.json({ error: 'Email or Phone already in use.' }, { status: 409 });
        }
      }
      throw error;
    }

    // 2. Handle Address 
    const existingAddress = await prisma.address.findFirst({
      where: { userId },
    });

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
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: addressData,
      });
    } else {
      if (addressLine1 || city || pincode) {
        await prisma.address.create({
          data: {
            userId,
            type: 'Home',
            ...addressData
          },
        });
      }
    }

    // 3. Return updated user data
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    console.log("✅ [API] Update Successful.");
    return NextResponse.json(finalUser);

  } catch (error: any) {
    console.error("🔥 [API] Critical Error:", error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}