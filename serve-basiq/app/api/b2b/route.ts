// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { Prisma } from '@prisma/client';

// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url);
//     const category = searchParams.get('cat');
//     const query = searchParams.get('q');

//     try {
//         const whereClause: Prisma.ProductWhereInput = {
//             AND: [],
//         };

//         if (Array.isArray(whereClause.AND)) {
//             if (category && category !== 'All') {
//                 whereClause.AND.push({ category });
//             }

//             if (query) {
//                 whereClause.AND.push({
//                     OR: [
//                         { name: { contains: query, mode: 'insensitive' } }, // ✅ FIX
//                         { description: { contains: query, mode: 'insensitive' } },
//                         { supplier: { contains: query, mode: 'insensitive' } },
//                     ],
//                 });
//             }
//         }

//         const products = await prisma.product.findMany({
//             where: whereClause,
//             orderBy: { updatedAt: 'desc' },
//         });

//         return NextResponse.json(products);
//     } catch (error) {
//         console.error('API Error:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch products' },
//             { status: 500 }
//         );
//     }
// }
