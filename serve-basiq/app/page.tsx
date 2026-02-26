import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import FeaturedProviders from '@/components/sections/FeaturedProviders';
import TrendingProducts from '@/components/sections/TrendingProducts';
import Hero from '@/components/home/Hero';
import ServiceCategories from '@/components/home/ServiceCategories';
import ProductCategories from '@/components/home/ProductCategories'; // ✅ Import
import HowItWorks from '@/components/home/HowItWorks';

import {
  FaWrench, FaBoxesStacked, FaPenFancy, FaStore,
  FaShieldHalved, FaWallet, FaHeadset, FaArrowRight, FaToolbox // ✅ Added FaTools here
} from 'react-icons/fa6';

export default async function Home() {

  // 1. Fetch Service Categories (Existing)
  const serviceCategories = await prisma.category.findMany({
    take: 6,
    where: {
      parentId: null,
      OR: [{ type: 'SERVICE' }, { type: 'BOTH' }]
    },
    select: { id: true, name: true, image: true }
  });

  // 2. ✅ Fetch Product Categories (New Logic based on your API)
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
      image: true // We need the image for the UI
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="pb-12 bg-gray-50/50">

      {/* 1. HERO SECTION */}
      <Hero />

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 space-y-16 pb-16">

        {/* 2. QUICK NAVIGATION CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* 1. Book Services */}
          <Link href="/services" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaWrench />
            </div>
            <h3 className="font-bold text-slate-900">Book Services</h3>
            <p className="text-xs text-gray-500 mt-1">Plumbers • Electricians</p>
          </Link>

          {/* 2. Buy Products */}
          <Link href="/products" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaBoxesStacked />
            </div>
            <h3 className="font-bold text-slate-900">Buy Products</h3>
            <p className="text-xs text-gray-500 mt-1">Local Shops • Wholesale</p>
          </Link>

          {/* 3. Rent Items */}
          <Link href="/rentals" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaToolbox />
            </div>
            <h3 className="font-bold text-slate-900">Rent Items</h3>
            <p className="text-xs text-gray-500 mt-1">Tools • Equipment</p>
          </Link>

          {/* 4. Post Requirement */}
          <Link href="/post-requirement" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaPenFancy />
            </div>
            <h3 className="font-bold text-slate-900">Post Requirement</h3>
            <p className="text-xs text-gray-500 mt-1">Get Quotes Fast</p>
          </Link>

        </div>

        {/* 3. CATEGORIES SECTION WRAPPER */}
        <div className="space-y-12">

          {/* Dynamic Service Categories */}
          <ServiceCategories categories={serviceCategories} />

          {/* Sponsored Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
              <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">Featured Partner</span>
              <h3 className="text-2xl font-extrabold mb-1">Urban Company Services</h3>
              <p className="text-purple-100 text-sm">Get 20% off your first deep cleaning service.</p>
            </div>
            <Link href="/services" className="relative z-10 bg-white text-purple-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition shadow-md active:scale-95">
              Book Now
            </Link>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* ✅ Dynamic Product Categories */}
          <ProductCategories categories={productCategories} />

        </div>

        {/* 4. LISTINGS */}
        <FeaturedProviders />
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