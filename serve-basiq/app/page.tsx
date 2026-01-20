// app/page.tsx
import Link from 'next/link';
import { prisma } from "@/lib/prisma"; // ✅ Import Prisma
import FeaturedProviders from '@/components/sections/FeaturedProviders';
import TrendingProducts from '@/components/sections/TrendingProducts';

// Icons
import {
  FaMagnifyingGlass,
  FaWrench,
  FaBoxesStacked,
  FaPenFancy,
  FaStore,
  FaScrewdriverWrench,
  FaBoxOpen,
  FaArrowRight,
  FaShieldHalved,
  FaWallet,
  FaHeadset,
  FaShop
} from 'react-icons/fa6';

// ✅ 1. Re-use the Style Map for consistency (Since DB only has ID/Name)
const STYLE_MAP: Record<string, { emoji: string; color: string }> = {
  cleaning: { emoji: "🧹", color: "blue" },
  repair: { emoji: "🛠️", color: "orange" },
  plumbing: { emoji: "💧", color: "cyan" },
  electrical: { emoji: "⚡", color: "yellow" },
  beauty: { emoji: "💅", color: "pink" },
  painting: { emoji: "🎨", color: "purple" },
  moving: { emoji: "📦", color: "indigo" },
  default: { emoji: "📌", color: "gray" }
};

// ✅ 2. Make the component async to fetch data
export default async function Home() {

  // ✅ 3. Fetch Categories directly from DB (Server Side)
  // We take 6 to fit the grid layout perfectly
  const serviceCategories = await prisma.category.findMany({
    take: 6,
    select: { id: true, name: true }
  });

  return (
    <div className="pb-12 bg-gray-50/50">

      {/* ================= HERO SECTION ================= */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-commerce-50 pb-16 pt-12 md:py-20 px-4 text-center rounded-b-[3rem] shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 text-brand-700 px-3 py-1.5 rounded-full text-[11px] font-bold mb-6 shadow-sm animate-fade-in cursor-default uppercase tracking-wider">
            <FaShieldHalved /> 100% Verified Providers
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900 tracking-tight">
            Find Local Experts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Source Factory Direct.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-slate-600 text-base md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            The safest marketplace to book services and buy wholesale products nearby. Secure payments, verified identities.
          </p>

          {/* HERO BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in px-4">
            <Link
              href="/services"
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <FaMagnifyingGlass /> Find a Service
            </Link>
            <Link
              href="/products"
              className="bg-white text-slate-900 border border-gray-200 px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-3 shadow-sm w-full sm:w-auto"
            >
              <FaShop className="text-commerce-600" /> Wholesale Market
            </Link>
          </div>
        </div>
      </div>
      {/* ================= END HERO SECTION ================= */}


      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 space-y-16 pb-16">

        {/* 1. QUICK NAVIGATION CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Link href="/services" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaWrench />
            </div>
            <h3 className="font-bold text-slate-900">Book Services</h3>
            <p className="text-xs text-gray-500 mt-1">Plumbers, Cleaners...</p>
          </Link>

          <Link href="/products" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaBoxesStacked />
            </div>
            <h3 className="font-bold text-slate-900">Wholesale</h3>
            <p className="text-xs text-gray-500 mt-1">Bulk Products</p>
          </Link>

          <Link href="/post-requirement" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaPenFancy />
            </div>
            <h3 className="font-bold text-slate-900">Post Request</h3>
            <p className="text-xs text-gray-500 mt-1">Get Custom Quotes</p>
          </Link>

          <Link href="/auth/register" className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition cursor-pointer border border-gray-100 group text-center active:scale-95">
            <div className="w-12 h-12 mx-auto bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
              <FaStore />
            </div>
            <h3 className="font-bold text-slate-900">Start Selling</h3>
            <p className="text-xs text-gray-500 mt-1">Join as Partner</p>
          </Link>
        </div>

        {/* 2. CATEGORIES SECTION */}
        <div className="space-y-12">

          {/* ✅ Service Categories (Dynamic from DB) */}
          <div>
            <div className="flex justify-between items-end mb-6 px-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaScrewdriverWrench className="text-brand-500" /> Popular Services
              </h2>
              <Link href="/services" className="text-xs font-bold text-slate-500 hover:text-brand-600 uppercase tracking-wide">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {serviceCategories.length > 0 ? (
                serviceCategories.map((cat) => {
                  // Apply Styling Map
                  const style = STYLE_MAP[cat.id] || STYLE_MAP.default;

                  return (
                    <Link
                      href={`/services/category/${cat.id}`} // ✅ Updated to correct dynamic route
                      key={cat.id}
                      className="bg-white border border-gray-100 p-4 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group"
                    >
                      <div className={`text-3xl mb-2 group-hover:scale-110 transition w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-${style.color}-50 text-${style.color}-600`}>
                        {style.emoji}
                      </div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{cat.name}</div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-400 text-sm py-4">No categories found.</div>
              )}
            </div>
          </div>

          {/* 3. SPONSORED BANNER */}
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

          {/* Product Categories (Static for now) */}
          <div>
            <div className="flex justify-between items-end mb-6 px-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaBoxOpen className="text-commerce-500" /> Wholesale Products
              </h2>
              <Link href="/products" className="text-xs font-bold text-slate-500 hover:text-commerce-600 uppercase tracking-wide">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { emoji: "🏗️", label: "Industrial" },
                { emoji: "📱", label: "Electronics" },
                { emoji: "📎", label: "Office" },
                { emoji: "🧱", label: "Construction" },
                { emoji: "🪑", label: "Furniture" },
                { emoji: "👕", label: "Fashion" },
              ].map((cat, i) => (
                <Link href={`/products?category=${cat.label}`} key={i} className="bg-white border border-gray-100 p-4 rounded-xl text-center hover:shadow-md transition cursor-pointer active:scale-95 group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition">{cat.emoji}</div>
                  <div className="text-xs font-bold text-slate-700">{cat.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 4. DYNAMIC LISTINGS */}
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

        {/* 6. CTA BANNER */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4">Ready to simplify your life?</h2>
            <p className="text-slate-300 mb-8">Join thousands of users who trust Servebasiq.</p>
            <Link href="/auth/register" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition shadow-lg inline-flex items-center gap-2 active:scale-95">
              Get Started for Free <FaArrowRight />
            </Link>
          </div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}