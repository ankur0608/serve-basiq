import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import CategoriesView from '@/components/categories/CategoriesView';

export const metadata: Metadata = {
    title: 'All Categories — Services, Products & Rentals Near You',
    description: 'Browse every category on ServeBasiq — home services, electronics, fashion, furniture, beauty products, auto accessories, building materials, event rentals, tools, vehicles and more, all from verified local providers near you.',
    keywords: [
        'all categories ServeBasiq', 'service categories India', 'product categories local',
        'rental categories', 'browse categories', 'local marketplace categories',
        'home services categories', 'wholesale product categories'
    ],
    alternates: { canonical: '/categories' },
    openGraph: {
        type: 'website',
        url: '/categories',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'All Categories — ServeBasiq',
        description: 'Browse every service, product, and rental category available on ServeBasiq.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Categories' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'All Categories — ServeBasiq',
        description: 'Browse every service, product, and rental category.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const categoriesJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/categories#webpage`,
            url: `${SITE_URL}/categories`,
            name: 'All Categories — ServeBasiq',
            description: 'Browse every service, product, and rental category available on ServeBasiq.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories` },
            ],
        },
    ],
};

export default function AllCategoriesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        }>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
            />
            <CategoriesView />
        </Suspense>
    );
}
