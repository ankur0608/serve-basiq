import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 1. Get the connection string from .env
const connectionString = process.env.DATABASE_URL;

// 2. Configure the standard Postgres pool
const pool = new Pool({ connectionString });

// 3. Create the Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Instantiate Prisma with the adapter
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;