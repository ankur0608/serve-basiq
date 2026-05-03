import { Suspense } from 'react';
import RentalsExplorer from '@/components/Rental/RentalsExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';
import { Metadata } from 'next';
// import InlinePageFAQ from '@/components/shared/InlinePageFAQ';
import { rentalsFaqs } from '@/components/FAQContent/faqData';

export const metadata: Metadata = {
    title: 'Rent Equipment, Vehicles & Spaces Near You — Local Rentals',
    description: 'Find rental services near you on ServeBasiq. Rent equipment, tools, vehicles, event supplies, furniture, and spaces from trusted local providers at affordable rates across India.',
    keywords: [
        'rentals near me', 'equipment rental India', 'vehicle rental nearby',
        'event rental services', 'furniture rental near me', 'tools for rent locally',
        'local rental marketplace', 'ServeBasiq rentals', 'rent near me India',
        'affordable rentals nearby', 'party supplies rental', 'construction equipment rental',
        'camera rental near me', 'tent rental for events', 'daily vehicle rental India'
    ],
    alternates: { canonical: '/rentals' },
    openGraph: {
        type: 'website',
        url: '/rentals',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Local Rentals Near You — ServeBasiq',
        description: 'Rent equipment, vehicles, spaces, and more from trusted local providers near you.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Rentals' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Local Rentals Near You — ServeBasiq',
        description: 'Rent equipment, vehicles, and spaces from trusted local providers.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const rentalsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            name: 'Local Rentals',
            description: 'Rent equipment, vehicles, event supplies, furniture, and spaces from trusted local providers across India.',
            url: `${SITE_URL}/rentals`,
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
            breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Rentals', item: `${SITE_URL}/rentals` },
                ],
            },
        },
        {
            '@type': 'FAQPage',
            mainEntity: rentalsFaqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
        },
    ],
};

export default function RentalsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalsJsonLd) }}
            />
            <h1 className="sr-only">Rent Equipment, Vehicles, Tools & Spaces Near You Across India</h1>
            <Suspense fallback={<ProductsSkeleton />}>
                <RentalsExplorer />
            </Suspense>
            {/* <InlinePageFAQ faqs={rentalsFaqs} title="Common Questions About Local Rentals" /> */}
        </>
    );
}
