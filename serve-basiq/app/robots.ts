import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.servebasiq.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/provider/dashboard/',
                    '/profile',
                    '/profile/',
                    '/favorites',
                    '/cancellations',
                    '/checkout',
                    '/cart',
                    '/*?sort=',
                    '/*?filter=',
                    '/*?page=',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
