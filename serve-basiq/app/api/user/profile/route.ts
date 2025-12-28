import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/* ================= GET PROFILE ================= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });

  return NextResponse.json(user);
}

/* ================= UPDATE PROFILE ================= */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      addressLine,
      city,
      state,
      pincode,
      country,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    const existingAddress = await prisma.address.findFirst({
      where: { userId },
    });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: { line1: addressLine, city, state, pincode, country },
      });
    } else {
      await prisma.address.create({
        data: {
          userId,
          type: 'Home',
          line1: addressLine,
          line2: '',
          city,
          state,
          pincode,
          country,
        },
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    return NextResponse.json(finalUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
