import { Metadata } from 'next';
import CareersContent from '@/components/Careers/CareersContent';

export const metadata: Metadata = {
    title: 'Careers — Join the Team Building India’s Local Marketplace',
    description: 'Explore career opportunities at ServeBasiq. We’re a small, focused team building India’s hyper-local marketplace for services, products, and rentals.',
    keywords: [
        'Careers ServeBasiq', 'jobs at ServeBasiq', 'startup jobs India',
        'local marketplace careers', 'work at ServeBasiq'
    ],
    alternates: { canonical: '/careers' },
    openGraph: {
        type: 'website',
        url: '/careers',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Careers at ServeBasiq — Build India’s Hyper-Local Marketplace',
        description: 'Join ServeBasiq, a small focused team making it easier to discover nearby services, products, and rentals.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Logo' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Careers at ServeBasiq',
        description: 'Join the team building India’s hyper-local marketplace.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const careersJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/careers#webpage`,
            url: `${SITE_URL}/careers`,
            name: 'Careers at ServeBasiq',
            description: 'Join the team building India\'s hyper-local marketplace for services, products, and rentals.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
            about: { '@type': 'Organization', name: 'ServeBasiq', url: SITE_URL },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Careers', item: `${SITE_URL}/careers` },
            ],
        },
    ],
};

export default function CareersPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(careersJsonLd) }}
            />
            <CareersContent />
        </>
    );
}
