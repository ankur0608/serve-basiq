import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — India’s Hyper-Local Marketplace for Services, Products & Rentals',
  description: 'Learn about ServeBasiq, India\'s leading neighborhood discovery platform. We connect you with trusted local service professionals, nearby product suppliers, and reliable rental businesses in your city.',
  keywords: [
    'About ServeBasiq', 'ServeBasiq platform', 'hyper-local marketplace India', 'nearby services',
    'local services India', 'buy products near me', 'home services professionals', 'local B2B marketplace',
    'find services nearby', 'verified local providers', 'rentals near me', 'local business discovery',
    'service providers near me', 'buy local products', 'home repair services', 'beauty services near me',
    'support local business', 'neighborhood services', 'trusted local vendors', 'equipment rentals local'
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    siteName: 'ServeBasiq',
    locale: 'en_IN',
    title: 'About ServeBasiq — Discover Nearby Services, Products & Rentals',
    description: 'Empowering local communities by connecting customers with verified nearby services, retail products, and daily rentals.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ServeBasiq Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ServeBasiq — Local Services & Products',
    description: 'India\'s go-to platform for discovering trusted neighborhood services, products, and rentals.',
    images: ['/logo.png'],
  },
};

const SITE_URL = 'https://www.servebasiq.in';

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: 'About ServeBasiq',
      description: 'Learn about ServeBasiq, India\'s leading neighborhood discovery platform for services, products, and rentals.',
      isPartOf: { '@type': 'WebSite', name: 'ServeBasiq', url: SITE_URL },
      about: { '@type': 'Organization', name: 'ServeBasiq', url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-24 text-center">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold tracking-wide">
              India's Trusted Hyper-Local Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Bridging the Gap Between You <br className="hidden md:block" />
              and Your Neighborhood
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              ServeBasiq is revolutionizing local commerce. We help you seamlessly discover and connect with <strong>nearby services, local retail products, and rental equipment</strong> from verified, trusted providers in your community. No more endless scrolling or unverified contacts—just real solutions, right near you.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium text-indigo-100">
              <Link href="/services" className="hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors">Find Services</Link>
              <span className="self-center opacity-50">•</span>
              <Link href="/products" className="hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors">Shop Products</Link>
              <span className="self-center opacity-50">•</span>
              <Link href="/rentals" className="hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors">Book Rentals</Link>
              <span className="self-center opacity-50">•</span>
              <Link href="/post-requirement" className="hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors">Post a Requirement</Link>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-20 space-y-24">

          {/* Why ServeBasiq Exists - Deep Dive */}
          <section className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Why We Built ServeBasiq</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                In an era of global e-commerce, the local neighborhood economy often gets left behind. Finding a reliable electrician, sourcing building materials from a nearby supplier, or renting party equipment for a weekend should not require sifting through outdated directories or relying on WhatsApp forwards. 
              </p>
              <p>
                <strong>The problem was clear:</strong> A massive disconnect between customers looking for immediate, local solutions and skilled local businesses struggling to gain digital visibility.
              </p>
              <p>
                ServeBasiq was created to be the ultimate digital bridge. We are a unified discovery platform dedicated to bringing <strong>hyper-local services, B2C/B2B products, and daily rentals</strong> into one clean, easy-to-navigate ecosystem. We empower you to support local economies while enjoying the convenience of modern technology.
              </p>
            </div>
          </section>

          {/* Core Offerings Cards (SEO Rich) */}
          <section>
            <h2 className="sr-only">Our Core Categories: Services, Products, and Rentals</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100 flex flex-col">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 w-max px-3 py-1 rounded-full mb-4">On-Demand</span>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Local Services</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6 flex-grow">
                  From emergency home repairs and deep cleaning to professional salons, CA services, and event management. Connect with verified independent freelancers and established agencies in your pin code.
                </p>
                <ul className="text-sm text-slate-500 space-y-2 mb-6 font-medium">
                  <li>✓ Home Maintenance & Repairs</li>
                  <li>✓ Beauty, Wellness & Salon</li>
                  <li>✓ Professional & IT Services</li>
                </ul>
                <Link href="/services" className="mt-auto inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                  Explore Services <span className="ml-2">→</span>
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100 flex flex-col">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-max px-3 py-1 rounded-full mb-4">Retail & Wholesale</span>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Nearby Products</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6 flex-grow">
                  Skip the long shipping times. Buy directly from local vendors, suppliers, and neighborhood stores. Find everything from fresh groceries and fashion to heavy building materials and electronics.
                </p>
                <ul className="text-sm text-slate-500 space-y-2 mb-6 font-medium">
                  <li>✓ Electronics & Home Appliances</li>
                  <li>✓ Fashion, Clothing & Accessories</li>
                  <li>✓ Furniture & Building Materials</li>
                </ul>
                <Link href="/products" className="mt-auto inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700">
                  Explore Products <span className="ml-2">→</span>
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100 flex flex-col">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 w-max px-3 py-1 rounded-full mb-4">Flexible</span>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Local Rentals</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6 flex-grow">
                  Why buy when you can rent locally? Find heavy machinery for construction, cameras for a photoshoot, party tents, or daily vehicle rentals without paying exorbitant premium fees.
                </p>
                <ul className="text-sm text-slate-500 space-y-2 mb-6 font-medium">
                  <li>✓ Vehicles & Transport</li>
                  <li>✓ Event & Party Equipment</li>
                  <li>✓ Tools, Machinery & Electronics</li>
                </ul>
                <Link href="/rentals" className="mt-auto inline-flex items-center text-orange-600 font-semibold hover:text-orange-700">
                  Explore Rentals <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Empowering Ecosystem (How it Helps) */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Building a Stronger Local Ecosystem</h2>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div>
                <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">For Customers & Consumers</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  We take the guesswork out of finding reliable help. ServeBasiq uses location-based intelligence to show you exactly what is available around you right now.
                </p>
                <ul className="space-y-3 text-slate-600 text-sm font-medium">
                  <li className="flex items-start"><span className="text-indigo-500 mr-2">✓</span> Instant discovery of nearby services, products & rentals</li>
                  <li className="flex items-start"><span className="text-indigo-500 mr-2">✓</span> Read authentic reviews and check ratings before hiring</li>
                  <li className="flex items-start"><span className="text-indigo-500 mr-2">✓</span> Contact local providers directly with zero hidden platform fees</li>
                  <li className="flex items-start"><span className="text-indigo-500 mr-2">✓</span> "Post a Requirement" feature for customized quotes from multiple vendors</li>
                </ul>
              </div>
              <div>
                <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">For Service Providers & Sellers</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  ServeBasiq acts as your digital storefront. We empower MSMEs, freelancers, and local shop owners to transition online without the technical headaches.
                </p>
                <ul className="space-y-3 text-slate-600 text-sm font-medium">
                  <li className="flex items-start"><span className="text-purple-500 mr-2">✓</span> Create a free, highly visible digital catalog for your business</li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">✓</span> Capture high-intent local leads generated from nearby searches</li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">✓</span> Manage inquiries and grow your customer base efficiently</li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">✓</span> Upgrade to "Verified Pro" status to build ultimate consumer trust</li>
                </ul>
                <Link href="/become-pro" className="mt-8 inline-block bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors shadow-md">
                  Register as a Seller / Pro
                </Link>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="grid sm:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-10 border border-indigo-100">
              <h3 className="text-2xl font-bold mb-4 text-indigo-900">Our Mission</h3>
              <p className="text-slate-700 leading-relaxed">
                To democratize digital commerce for local Indian businesses. We are on a mission to make neighborhood services, physical products, and rental equipment infinitely easier to discover, while providing local entrepreneurs with the tech infrastructure they need to scale their livelihood.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-10 border border-purple-100">
              <h3 className="text-2xl font-bold mb-4 text-purple-900">Our Vision</h3>
              <p className="text-slate-700 leading-relaxed">
                We envision a completely interconnected local economy where every Indian relies on ServeBasiq as their primary utility tool. Whether you need a 2AM plumber, a bulk order of office laptops, or a rental camera for a weekend trip—your neighborhood has it, and ServeBasiq will find it.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-[2.5rem] p-12 text-center shadow-2xl">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
               <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl"></div>
               <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-5">Start Exploring What's Near You</h2>
              <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of users discovering the power of their local economy. Services, products, or rentals — everything you need is just around the corner.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/" className="w-full sm:w-auto bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg hover:shadow-xl">
                  Explore ServeBasiq Now
                </Link>
                <Link href="/contact" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Contact Support
                </Link>
              </div>
            </div>
          </section>

          {/* Internal Links Footer */}
          <section className="text-center pt-8 border-t border-slate-200">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <Link href="/faq" className="hover:text-indigo-600 transition-colors">Frequently Asked Questions</Link>
              <span className="hidden sm:inline text-slate-300">|</span>
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <span className="hidden sm:inline text-slate-300">|</span>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
              <span className="hidden sm:inline text-slate-300">|</span>
              <Link href="/careers" className="hover:text-indigo-600 transition-colors">Join Our Team</Link>
            </nav>
          </section>

        </div>
      </main>
    </div>
  );
}