import { Metadata } from 'next';
import FAQContent from '@/components/FAQContent/FAQContent';
import { faqs } from '@/components/FAQContent/faqData';

export const metadata: Metadata = {
    title: 'FAQ — Common Questions About Local Services, Products & Rentals',
    description: 'Find answers to frequently asked questions about using ServeBasiq to discover nearby services, products, and rentals. Learn how to book, list, or become a verified Pro provider.',
    keywords: [
        'ServeBasiq FAQ', 'how to use ServeBasiq', 'book local service', 'list products ServeBasiq',
        'nearby services questions', 'ServeBasiq how it works', 'local marketplace FAQ India',
        'become a provider ServeBasiq', 'post requirement FAQ'
    ],
    alternates: { canonical: '/faq' },
    openGraph: {
        type: 'website',
        url: '/faq',
        siteName: 'ServeBasiq',
        locale: 'en_IN',
        title: 'Frequently Asked Questions — ServeBasiq',
        description: 'Everything you need to know about finding nearby services, products, and rentals on ServeBasiq.',
        images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Logo' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Frequently Asked Questions — ServeBasiq',
        description: 'Everything you need to know about using ServeBasiq.',
        images: ['/logo.png'],
    },
};

const SITE_URL = 'https://www.servebasiq.in';

export default function FAQPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'FAQPage',
                '@id': `${SITE_URL}/faq#webpage`,
                url: `${SITE_URL}/faq`,
                name: 'Frequently Asked Questions — ServeBasiq',
                isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
                mainEntity: faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                    },
                })),
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/faq` },
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
            <FAQContent />
        </>
    );
}