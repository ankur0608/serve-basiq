import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import FeaturedProviders from '@/components/sections/FeaturedProviders';
import TrendingProducts from '@/components/sections/TrendingProducts';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import BecomeProviderBanner from "@/components/profile/BecomeProviderBanner";
import StartSellingCard from "@/components/home/StartSellingCard"; // ✅ Imported new component

import {
  FaShieldHalved, 
  FaWallet, 
  FaHeadset,
  FaWrench,
  FaCubes,
  FaPenNib
} from 'react-icons/fa6';

import HomeServiceCategories from '@/components/home/HomeServiceCategories';
import HomeProductCategories from '@/components/home/HomeProductCategories';
import FeaturedRentals from '@/components/sections/FeaturedRentals';

export const metadata: Metadata = {
  title: 'ServeBasiq — Buy Local Products, Services & Rentals Near You',
  description: 'Discover verified local services, buy products from nearby sellers, and rent equipment in your city. India\'s hyper-local marketplace connecting customers with trusted local providers.',
  keywords: [
    'local marketplace India', 'services near me', 'buy products locally', 'rent equipment near me',
    'book home services', 'nearby service providers', 'hyper-local marketplace', 'ServeBasiq',
    'plumber near me', 'electrician near me', 'furniture near me', 'local business directory India',
    'book local professionals', 'find vendors near me', 'B2B marketplace India',
    'home repair services', 'beauty services nearby', 'wholesale products India'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'ServeBasiq',
    locale: 'en_IN',
    title: 'ServeBasiq — Local Products, Services & Rentals Near You',
    description: 'India\'s hyper-local marketplace to discover services, buy products, and rent equipment near you.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServeBasiq — Local Products, Services & Rentals',
    description: 'Discover verified local services, nearby products, and rental equipment in your city.',
    images: ['/logo.png'],
  },
};

const SITE_URL = 'https://www.servebasiq.in';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ServeBasiq',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      description: 'India\'s hyper-local marketplace connecting customers with nearby services, products, and rentals from verified providers.',
      areaServed: { '@type': 'Country', name: 'India' },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'servebasiq@gmail.com',
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'ServeBasiq',
      description: 'Discover verified local services, products, and rentals near you.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default async function Home() {

  // 1. Fetch Service Categories
  const serviceCategories = await prisma.category.findMany({
    take: 6,
    where: {
      parentId: null,
      OR: [{ type: 'SERVICE' }, { type: 'BOTH' }]
    },
    select: { id: true, name: true, image: true }
  });

  // 2. Fetch Product Categories
  const productCategories = await prisma.category.findMany({
    take: 6,
    where: {
      parentId: null, // Top level only
      OR: [
        { type: 'PRODUCT' },
        { type: 'BOTH' }
      ]
    },
    select: {
      id: true,
      name: true,
      image: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="pb-12 bg-gray-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* 1. HERO SECTION */}
      <Hero />

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-16 relative z-20 space-y-16 pb-16">

        {/* 2. MAIN ACTION CARDS */}
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Book Services */}
          <Link href="/services" className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all border border-gray-100 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-blue-50 text-blue-500">
              <FaWrench size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Book Services</h3>
            <p className="text-xs text-slate-500 text-center">Plumbers, Cleaners...</p>
          </Link>

          {/* Card 2: Wholesale */}
          <Link href="/products" className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all border border-gray-100 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-green-50 text-green-500">
              <FaCubes size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Wholesale</h3>
            <p className="text-xs text-slate-500 text-center">Bulk Products</p>
          </Link>

          {/* Card 3: Post Request */}
          <Link href="/post-requirement" className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all border border-gray-100 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-purple-50 text-purple-500">
              <FaPenNib size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Post Request</h3>
            <p className="text-xs text-slate-500 text-center">Get Custom Quotes</p>
          </Link>

          {/* Card 4: Start Selling (Now an interactive client component) */}
          <StartSellingCard />

        </div>

        {/* 3. CATEGORIES & BANNERS */}
        <div className="space-y-12">
          <HomeServiceCategories categories={serviceCategories} />
          <BecomeProviderBanner />
          <HomeProductCategories categories={productCategories} />
        </div>

        {/* 4. LISTINGS */}
        <FeaturedProviders />
        <FeaturedRentals />
        <TrendingProducts />

        {/* 5. WHY CHOOSE US */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
              <FaShieldHalved />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Verified Identity</h4>
            <p className="text-xs text-gray-500 leading-relaxed">We strictly check IDs and licenses of every provider.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
              <FaWallet />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Secure Payments</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Your money is held safely until the job is done.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
              <FaHeadset />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">24/7 Support</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Dedicated help center for any questions or issues.</p>
          </div>
        </div>

        <HowItWorks />

      </div>
    </div>
  );
}