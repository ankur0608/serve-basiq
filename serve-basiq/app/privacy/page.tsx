import { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/PrivacyPolicyContent/PrivacyPolicyContent';

export const metadata: Metadata = {
    title: 'Privacy Policy — How We Protect Your Data',
    description: 'Read the ServeBasiq Privacy Policy to understand how we collect, use, and protect your personal information when you use our local services and products platform.',
    keywords: [
        'ServeBasiq privacy policy', 'data protection ServeBasiq',
        'user data ServeBasiq', 'privacy local marketplace India'
    ],
    alternates: { canonical: '/privacy' },
    openGraph: {
        type: 'website',
        url: '/privacy',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Privacy Policy — ServeBasiq',
        description: 'Learn how ServeBasiq collects, uses, and protects your information on our local discovery platform.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Logo' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy — ServeBasiq',
        description: 'How ServeBasiq collects, uses, and protects your data.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

export default function PrivacyPolicyPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${SITE_URL}/privacy#webpage`,
                url: `${SITE_URL}/privacy`,
                name: 'Privacy Policy | ServeBasiq',
                description: 'Read the ServeBasiq Privacy Policy to understand how we collect, use, and protect your personal information.',
                isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
                publisher: { '@type': 'Organization', name: 'ServeBasiq' },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Privacy', item: `${SITE_URL}/privacy` },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PrivacyPolicyContent />
        </>
    );
}