import { Metadata } from 'next';
import ContactContent from '@/components/Contact/ContactContent';

export const metadata: Metadata = {
    title: 'Contact ServeBasiq — Support, Partnerships & Provider Inquiries',
    description: 'Contact the ServeBasiq team for questions about local services, products, rentals, or listings. We typically respond within 24 hours. Reach out for support, partnerships, or provider inquiries.',
    keywords: [
        'contact ServeBasiq', 'ServeBasiq support', 'local service help',
        'list my business ServeBasiq', 'ServeBasiq partner inquiry',
        'nearby services help', 'service provider support India'
    ],
    alternates: { canonical: '/contact' },
    openGraph: {
        type: 'website',
        url: '/contact',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Contact ServeBasiq — Support & Inquiries',
        description: 'Reach out to ServeBasiq for help with local services, products, rentals, or becoming a Pro partner.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact ServeBasiq',
        description: 'Support, partnerships, and provider inquiries.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const contactJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'ContactPage',
            '@id': `${SITE_URL}/contact#webpage`,
            url: `${SITE_URL}/contact`,
            name: 'Contact ServeBasiq',
            description: 'Support, partnerships, and provider inquiries for India\'s hyper-local marketplace.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
        },
        {
            '@type': 'Organization',
            name: 'ServeBasiq',
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    email: 'servebasiq@gmail.com',
                    contactType: 'customer support',
                    availableLanguage: ['English', 'Hindi'],
                    areaServed: 'IN',
                },
            ],
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
            ],
        },
    ],
};

export default function ContactPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
            />
            <ContactContent />
        </>
    );
}
