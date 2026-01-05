import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, businessName, category, price, location, description, imageUrl } = body;

  try {
    // Transaction: Create Service AND Update User status at the same time
    const result = await prisma.$transaction(async (tx) => {

      // 1. Create the Service Listing (Updated for new Schema)
      await tx.service.create({
        data: {
          userId: userId,
          name: businessName,

          // ✅ FIX 1: Map 'category' to 'categoryId'
          // Ensure this matches your seeded IDs (e.g., 'cleaning', 'repair')
          categoryId: category.toLowerCase(),

          price: parseFloat(price),

          // ✅ FIX 2: Map simple 'location' string to new Address fields
          // Since the simple form only has one "location" field, we use it for both city and addressLine1 temporarily.
          city: location,
          addressLine1: location,
          state: "Pending", // Default value until they update profile
          pincode: "000000", // Default value

          desc: description,
          img: imageUrl,
          isVerified: false, // Badge is false initially

          // ✅ FIX 3: Add required fields for the new schema with defaults
          latitude: 0,
          longitude: 0,
          radiusKm: 10,
          workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          openTime: '09:00',
          closeTime: '18:00'
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
    console.error("Worker Apply Error:", error);
    return NextResponse.json({ error: "Application failed" }, { status: 500 });
  }
}