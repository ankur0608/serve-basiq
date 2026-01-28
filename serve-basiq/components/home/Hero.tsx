import Link from "next/link";
import {
  FaMagnifyingGlass,
  FaShieldHalved,
  FaShop,
  FaArrowTrendUp,
  FaStar,
} from "react-icons/fa6";

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-brand-50 via-white to-commerce-50 pb-16 pt-8 md:py-20 px-4 text-center rounded-b-[3rem] shadow-sm relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 text-brand-700 px-3 py-1.5 rounded-full text-[11px] font-bold mb-6 shadow-sm animate-fade-in cursor-default uppercase tracking-wider">
          <FaShieldHalved /> 100% Verified & Insured Providers
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900 tracking-tight">
          Experts You Can Trust.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            Prices You'll Love.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-600 text-base md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          Connect directly with local professionals and factories.{" "}
          <strong>No middleman markups. Guaranteed safety.</strong>
        </p>

        {/* SEARCH SECTION */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white p-2 rounded-full shadow-lg flex items-center border border-gray-100">
            <div className="pl-4 text-gray-400">
              <FaMagnifyingGlass size={20} />
            </div>
            <input
              type="text"
              placeholder="What do you need help with today?"
              className="flex-grow px-4 py-3 text-gray-700 bg-transparent focus:outline-none font-medium"
            />
            <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition active:scale-95">
              Search
            </button>
          </div>
          {/* Popular Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <span className="font-bold uppercase tracking-wider text-xs mr-2">
              Popular Now:
            </span>
            <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full">
              <FaArrowTrendUp className="text-brand-500" /> Cleaning
            </span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full">
              Plumber
            </span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full">
              Electronics
            </span>
          </div>
        </div>

        {/* STATISTICS BLOCK */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-6 max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900">
                500+
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
                Verified Experts
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900">
                10k+
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
                Transactions
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
                4.9 <FaStar className="text-yellow-400" size={32} />
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
                Average Rating
              </div>
            </div>
          </div>
        </div>

        {/* HERO BUTTONS (Original) */}
        {/* <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in px-4">
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
        </div> */}
      </div>
    </div>
  );
}
