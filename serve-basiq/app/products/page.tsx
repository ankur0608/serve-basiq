import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsExplorer from '@/components/products/ProductsExplorer';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';
// import InlinePageFAQ from '@/components/shared/InlinePageFAQ';
import { productsFaqs } from '@/components/FAQContent/faqData';

export const metadata: Metadata = {
  title: 'B2B Marketplace — Wholesale Products, Electronics, Furniture & More',
  description: 'Explore top-quality B2B and retail products from verified local sellers on ServeBasiq. Electronics, furniture, fashion, beauty, auto accessories, and building materials delivered from nearby suppliers across India.',
  keywords: [
    'B2B marketplace India', 'wholesale products', 'business products', 'buy from local sellers',
    'bulk orders', 'electronics near me', 'furniture nearby', 'building materials local',
    'nearby products India', 'verified suppliers', 'ServeBasiq products',
    'auto accessories local', 'fashion products India', 'beauty products near me',
    'home appliances local', 'kitchen equipment wholesale', 'buy products in bulk India'
  ],
  alternates: { canonical: '/products' },
  openGraph: {
    type: 'website',
    url: '/products',
    siteName: 'ServeBasiq',
    locale: 'en_IN',
    title: 'B2B Marketplace — ServeBasiq',
    description: 'Explore top-quality B2B and retail products from verified local sellers near you.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Products' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B2B Marketplace — ServeBasiq',
    description: 'Explore top-quality products from verified local sellers.',
    images: ['/logo.png'],
  },
};

const SITE_URL = 'https://www.servebasiq.in';

const productsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Products Marketplace',
      description: 'Browse verified local sellers offering electronics, furniture, fashion, beauty, auto accessories, and building materials across India.',
      url: `${SITE_URL}/products`,
      isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: productsFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
};

export default function B2BMarketplacePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      <h1 className="sr-only">B2B Marketplace — Wholesale & Retail Products from Verified Local Sellers in India</h1>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsExplorer />
      </Suspense>
      {/* <InlinePageFAQ faqs={productsFaqs} title="Common Questions About Buying Products" /> */}
    </>
  );
}
