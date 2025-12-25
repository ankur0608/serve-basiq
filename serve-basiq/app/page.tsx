// app/page.tsx
import Link from 'next/link';
import FeaturedProviders from '@/components/sections/FeaturedProviders'; // Import New Component
import TrendingProducts from '@/components/sections/TrendingProducts'; // Import New Component

// Icons
import {
  FaMagnifyingGlass,
  FaCartShopping,
  FaBullhorn,
  FaShop,
  FaStar,
  FaUserPlus,
  FaStore
} from 'react-icons/fa6';

export default function Home() {
  return (
    <div className="pb-12">

      {/* ================= HERO SECTION ================= */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-commerce-50 pb-16 pt-12 md:py-24 px-4 text-center rounded-b-[3rem] shadow-sm relative overflow-hidden">
        {/* ... (Hero content same as before) ... */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 text-brand-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Trusted by 50,000+ Businesses & Homes
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 leading-tight text-slate-900 tracking-tight">
            Hire Experts. <span className="text-gray-300 mx-2 hidden md:inline">|</span> Source Wholesale.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-commerce-600">
              The Global Marketplace.
            </span>
          </h1>

          <p className="text-slate-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Book verified local professionals for any service or source bulk products directly from top-rated manufacturers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 space-y-20">

        {/* ================= 4 MAIN TILES ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/services" className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition text-center border border-gray-100 group">
            <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition shadow-sm">
              <FaMagnifyingGlass />
            </div>
            <h3 className="font-bold text-slate-900">Find Services</h3>
            <p className="text-xs text-gray-500 mt-1">Plumbers, Cleaners...</p>
          </Link>

          <Link href="/products" className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition text-center border border-gray-100 group">
            <div className="w-14 h-14 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition shadow-sm">
              <FaCartShopping />
            </div>
            <h3 className="font-bold text-slate-900">Buy Products</h3>
            <p className="text-xs text-gray-500 mt-1">Wholesale Sourcing</p>
          </Link>

          <Link href="/post-requirement" className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition text-center border border-gray-100 group">
            <div className="w-14 h-14 mx-auto bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition shadow-sm">
              <FaBullhorn />
            </div>
            <h3 className="font-bold text-slate-900">Post Your Need</h3>
            <p className="text-xs text-gray-500 mt-1">We&apos;ll find options</p>
          </Link>

          <Link href="/auth/register" className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition text-center border border-gray-100 group">
            <div className="w-14 h-14 mx-auto bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition shadow-sm">
              <FaShop />
            </div>
            <h3 className="font-bold text-slate-900">Sell on ServeMate</h3>
            <p className="text-xs text-gray-500 mt-1">Join as Partner</p>
          </Link>
        </div>

        {/* ================= HOW IT WORKS ================= */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How It Works</h2>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">Simple, fast, and transparent. Get your job done in 3 easy steps.</p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gray-200 -z-10"></div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm">1</div>
              <h3 className="font-bold text-lg mb-2">Search or Post</h3>
              <p className="text-sm text-gray-500">Browse verified listings or post your specific requirement for free.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm">2</div>
              <h3 className="font-bold text-lg mb-2">Compare Quotes</h3>
              <p className="text-sm text-gray-500">Chat with professionals/suppliers, compare prices, and check reviews.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm">3</div>
              <h3 className="font-bold text-lg mb-2">Hire & Pay</h3>
              <p className="text-sm text-gray-500">Book the service or order products. Pay securely only when satisfied.</p>
            </div>
          </div>
        </div>

        {/* ================= FEATURED SECTIONS (Using New Components) ================= */}
        <FeaturedProviders />
        <TrendingProducts />

        {/* ================= CUSTOMER STORIES ================= */}
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8 text-center">Customer Stories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex gap-1 text-amber-400 mb-4 text-sm">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-lg font-medium leading-relaxed text-slate-700 italic mb-6">
                &quot;ServeMate transformed how we source raw materials. The B2B market is incredibly efficient and secure.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">R</div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Rajesh Kumar</div>
                  <div className="text-xs text-gray-500">Factory Owner, Delhi</div>
                </div>
              </div>
            </div>

            <div className="bg-brand-600 text-white rounded-3xl p-8 shadow-lg shadow-brand-500/30 hover:shadow-xl transition">
              <div className="flex gap-1 text-brand-300 mb-4 text-sm">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-lg font-medium leading-relaxed italic mb-6">
                &quot;Found a plumber in 5 minutes for an emergency leak. He arrived within the hour. Absolute lifesaver app!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-brand-600 rounded-full flex items-center justify-center font-bold">S</div>
                <div>
                  <div className="font-bold text-sm">Sarah Jenkins</div>
                  <div className="text-xs text-brand-200">Homeowner, Mumbai</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= JOIN SECTION ================= */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-600 rounded-full blur-[80px] opacity-40"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-commerce-600 rounded-full blur-[80px] opacity-40"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Grow Your Business</h2>
            <p className="text-slate-300 text-lg mb-8">
              Join thousands of service providers and suppliers finding new customers every day.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2">
                <FaUserPlus className="text-brand-600" /> Join as Professional
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-2">
                <FaStore className="text-commerce-400" /> Join as Supplier
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}