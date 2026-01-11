import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/* ================= GET PROFILE ================= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    // Search for user by ID, Email, OR Phone (whatever identifier was passed)
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

/* ================= UPDATE PROFILE ================= */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Update User Details
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone, // Update phone number
      },
    });

    // 2. Handle Address (Check if exists, then update or create)
    const existingAddress = await prisma.address.findFirst({
      where: { userId },
    });

    if (existingAddress) {
      // Update existing address
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          line1: addressLine,
          city,
          state,
          pincode,
          country: country || 'India'
        },
      });
    } else {
      // Create new address ONLY if data is provided
      if (addressLine || city || pincode) {
        await prisma.address.create({
          data: {
            userId,
            type: 'Home',
            line1: addressLine || '',
            line2: '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            country: country || 'India',
          },
        });
      }
    }

    // 3. Return updated user data (including new address)
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    return NextResponse.json(finalUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}