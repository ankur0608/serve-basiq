import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ServicesExplorer from '@/components/services/ServicesExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Local Services Near You — Home, Beauty, Repair & More',
    description: 'Find verified local service providers near you on ServeBasiq. Browse home repair, plumbing, electrical, cleaning, beauty, tutoring, and professional services. Book trusted professionals in your neighbourhood across India.',
    keywords: [
        'local services near me', 'home services India', 'plumber near me', 'electrician near me',
        'cleaning services near me', 'beauty services near me', 'repair services nearby',
        'professional services local', 'book home services', 'ServeBasiq services',
        'trusted local professionals', 'service providers India', 'AC repair near me',
        'carpenter near me', 'painting services nearby'
    ],
    alternates: { canonical: '/services' },
    openGraph: {
        type: 'website',
        url: '/services',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Explore Local Services — ServeBasiq',
        description: 'Browse and book verified local service providers for home, beauty, repair and professional needs near you.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Services' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Local Services Near You — ServeBasiq',
        description: 'Browse and book verified local service providers near you.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const servicesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Local Services',
    description: 'Browse verified local service providers for home, beauty, repair and professional needs across India.',
    url: `${SITE_URL}/services`,
    isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        ],
    },
};

export default async function ServicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const queryClient = new QueryClient();
    const resolvedSearchParams = await searchParams;
    const categoryId = typeof resolvedSearchParams.categoryId === 'string' ? resolvedSearchParams.categoryId : '';

    const params = new URLSearchParams();
    params.append('limit', '24');
    if (categoryId) params.append('categoryId', categoryId);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['services', 'explorer', '', categoryId, '', '', ''],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/services?${params.toString()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        },
        initialPageParam: undefined,
    });

    await queryClient.prefetchQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/categories?type=SERVICE`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        },
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
            />
            <h1 className="sr-only">Local Services Near You — Home Repair, Beauty, Plumbing, Electrical & More</h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<ProductsSkeleton />}>
                    <ServicesExplorer />
                </Suspense>
            </HydrationBoundary>
        </>
    );
}
