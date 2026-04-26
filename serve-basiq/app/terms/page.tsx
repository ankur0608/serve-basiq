import { Metadata } from 'next';
import TermsContent from '@/components/TermsContent/TermsContent';

export const metadata: Metadata = {
    title: 'Terms & Conditions — Platform Usage Agreement',
    description: 'Read the ServeBasiq Terms and Conditions before using our local services, products, and rentals marketplace. Understand your rights and responsibilities as a user or service provider.',
    keywords: [
        'ServeBasiq terms and conditions', 'ServeBasiq user agreement',
        'local marketplace terms India', 'ServeBasiq provider terms'
    ],
    alternates: { canonical: '/terms' },
    openGraph: {
        type: 'website',
        url: '/terms',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Terms & Conditions — ServeBasiq',
        description: 'Understand the terms governing your use of ServeBasiq\'s local discovery platform.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Terms & Conditions — ServeBasiq',
        description: 'Platform usage agreement for ServeBasiq.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const termsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/terms#webpage`,
            url: `${SITE_URL}/terms`,
            name: 'Terms & Conditions | ServeBasiq',
            description: 'Platform usage agreement for ServeBasiq.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
            publisher: { '@type': 'Organization', name: 'ServeBasiq' },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Terms', item: `${SITE_URL}/terms` },
            ],
        },
    ],
};

export default function TermsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
            />
            <TermsContent />
        </>
    );
}
