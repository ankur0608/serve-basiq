import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, businessName, category, price, location, description, imageUrl } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {

      await tx.service.create({
        data: {
          userId: userId,
          name: businessName,

          categoryId: category.toLowerCase(),

          price: parseFloat(price),

      
          city: location,
          addressLine1: location,
          state: "Pending",
          pincode: "000000", 

          desc: description,
          serviceimg: imageUrl,
          isVerified: false, 
          latitude: 0,
          longitude: 0,
          radiusKm: 10,
          workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          openTime: '09:00',
          closeTime: '18:00'
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isWorker: true,
          isVerified: false 
        }
      });

      return updatedUser;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Worker Apply Error:", error);
    return NextResponse.json({ error: "Application failed" }, { status: 500 });
  }
}