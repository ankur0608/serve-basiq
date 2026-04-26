import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.servebasiq.in';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [services, products, rentals, categories] = await Promise.all([
        prisma.service.findMany({
            where: { isVerified: true, user: { isVerified: true } },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
        }),
        prisma.product.findMany({
            where: { isVerified: true, user: { isVerified: true } },
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 5000,
        }),
        prisma.rental.findMany({
            where: { isVerified: true, user: { isVerified: true } },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
        }),
        prisma.category.findMany({
            where: { parentId: null },
            select: { id: true, type: true, updatedAt: true },
        }),
    ]);

    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/rentals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/post-requirement`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/become-pro`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/categories?tab=SERVICE`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
        { url: `${SITE_URL}/categories?tab=PRODUCT`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
        { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) => {
        const entries: MetadataRoute.Sitemap = [];
        if (c.type === 'SERVICE' || c.type === 'BOTH') {
            entries.push({
                url: `${SITE_URL}/services?category=${c.id}`,
                lastModified: c.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        }
        if (c.type === 'PRODUCT' || c.type === 'BOTH') {
            entries.push({
                url: `${SITE_URL}/products?category=${c.id}`,
                lastModified: c.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        }
        return entries;
    });

    const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
        url: `${SITE_URL}/services/${s.id}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${SITE_URL}/products/${p.id}`,
        lastModified: p.createdAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const rentalRoutes: MetadataRoute.Sitemap = rentals.map((r) => ({
        url: `${SITE_URL}/rentals/${r.id}`,
        lastModified: r.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        ...staticRoutes,
        ...categoryRoutes,
        ...serviceRoutes,
        ...productRoutes,
        ...rentalRoutes,
    ];
}
