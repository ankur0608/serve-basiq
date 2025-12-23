import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, businessName, category, price, location, description, imageUrl } = body;

  try {
    // Transaction: Create Service AND Update User status at the same time
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Service Listing
      await tx.service.create({
        data: {
          userId: userId,
          name: businessName,
          cat: category,
          price: parseFloat(price),
          loc: location,
          desc: description,
          img: imageUrl,
          verified: false // Badge is false initially
        }
      });

      // 2. Mark User as a Worker (but NOT verified by admin yet)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isWorker: true,
          isVerified: false // MUST BE FALSE until Admin approves
        }
      });

      return updatedUser;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Application failed" }, { status: 500 });
  }
}