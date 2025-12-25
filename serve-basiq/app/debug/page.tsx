import { prisma } from '@/lib/prisma';

export default async function DebugPage() {
    const products = await prisma.product.findMany();
    return (
        <div className="p-10">
            <h1>Valid Product IDs:</h1>
            <pre>{JSON.stringify(products, null, 2)}</pre>
        </div>
    );
}