import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('cat');
  const query = searchParams.get('q');

  try {
    const whereClause: Prisma.ServiceWhereInput = {
      AND: [
        // 🚨 CRITICAL: Only show if User is Verified by Admin
        {
          user: {
            isVerified: true 
          }
        }
      ]
    };

    if (category && category !== 'All' && Array.isArray(whereClause.AND)) {
      whereClause.AND.push({ cat: category });
    }

    if (query && Array.isArray(whereClause.AND)) {
      whereClause.AND.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { desc: { contains: query, mode: 'insensitive' } },
        ]
      });
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: { user: true }, // Include user details
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}