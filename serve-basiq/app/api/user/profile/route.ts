import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Ensure data is always fresh

/* ================= 1. GET PROFILE (User + Address + Activity) ================= */
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
      include: {
        addresses: true,
        // ✅ 1. Fetch Orders (Products)
        orders: {
          include: {
            product: {
              select: {
                name: true,
                productImage: true,
                user: { select: { shopName: true, name: true } } // Seller Name
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        // ✅ 2. Fetch Bookings (Services)
        bookings: {
          include: {
            service: {
              select: {
                name: true,
                mainimg: true,
                user: { select: { name: true, shopName: true } }, // Provider Name
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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userUpdateData: any = { name };

    if (email && email.trim() !== "") userUpdateData.email = email;
    if (phone && phone.trim() !== "") userUpdateData.phone = phone;

    if (dateOfBirth) userUpdateData.dob = new Date(dateOfBirth);
    if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

    // 1. Update User
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // 2. Update Address
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

    // 3. Return Updated User (with relations to keep UI consistent)
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        // We don't necessarily need to return full orders/bookings on profile update
        // unless you want to refetch everything. Usually addresses is enough here.
        orders: true,
        bookings: true
      },
    });

    return NextResponse.json(finalUser);

  } catch (error: any) {
    console.error("🔥 [API] Update Error:", error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}