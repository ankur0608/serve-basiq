import { Metadata } from 'next';
import BecomeProForm from "@/components/become-pro/BecomeProForm";

export const metadata: Metadata = {
    title: 'Become a Pro Partner — List Your Services & Reach Local Customers',
    description: 'Register as a ServeBasiq Pro partner to list your services, products, or rentals and reach thousands of nearby customers. Grow your local business digitally — free to join.',
    keywords: [
        'become ServeBasiq provider', 'list services online India', 'list products locally',
        'grow local business digitally', 'service provider registration', 'join ServeBasiq',
        'sell products near me', 'local business listing India', 'pro partner ServeBasiq',
        'reach local customers online', 'register as provider'
    ],
    alternates: { canonical: '/become-pro' },
    openGraph: {
        type: 'website',
        url: '/become-pro',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Become a Pro Partner — ServeBasiq',
        description: 'List your services, products, or rentals on ServeBasiq and reach local customers near you.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Pro' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Become a Pro Partner — ServeBasiq',
        description: 'Register as a provider and reach thousands of nearby customers.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const becomeProJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/become-pro#webpage`,
            url: `${SITE_URL}/become-pro`,
            name: 'Become a Pro Partner | ServeBasiq',
            description: 'Register as a provider to list your services, products, or rentals and reach local customers.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Become a Pro', item: `${SITE_URL}/become-pro` },
            ],
        },
    ],
};

export default function BecomeProPage() {
    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(becomeProJsonLd) }}
            />
            <BecomeProForm />
        </main>
    );
}
