import { Metadata } from 'next';
import PostRequirementForm from "@/components/requirements/PostRequirementForm";

export const metadata: Metadata = {
    title: 'Post a Requirement — Tell Us What You Need Locally',
    description: 'Post your requirement on ServeBasiq and get matched with the right local service providers, product sellers, or rental providers near you. Free to post — get quotes quickly.',
    keywords: [
        'post requirement ServeBasiq', 'find local service provider', 'get quotes near me',
        'post job requirement India', 'hire local professional', 'local service request',
        'find product supplier nearby', 'get matched with providers', 'service inquiry India'
    ],
    alternates: { canonical: '/post-requirement' },
    openGraph: {
        type: 'website',
        url: '/post-requirement',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Post a Requirement — ServeBasiq',
        description: 'Tell us what service, product or rental you need and get connected with trusted local providers.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Post a Requirement — ServeBasiq',
        description: 'Get matched with nearby service providers and sellers.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

const postRequirementJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/post-requirement#webpage`,
            url: `${SITE_URL}/post-requirement`,
            name: 'Post a Requirement | ServeBasiq',
            description: 'Describe what you need and receive quotes from multiple trusted local providers near you.',
            isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
            potentialAction: {
                '@type': 'Action',
                name: 'Post a Requirement',
                target: `${SITE_URL}/post-requirement`,
            },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Post Requirement', item: `${SITE_URL}/post-requirement` },
            ],
        },
    ],
};

export default function PostRequirementPage() {
    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(postRequirementJsonLd) }}
            />
            <PostRequirementForm />
        </main>
    );
}
