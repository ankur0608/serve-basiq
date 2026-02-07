import Link from "next/link";
import {
  FaMagnifyingGlass,
  FaShieldHalved,
  FaArrowTrendUp,
  FaStar,
} from "react-icons/fa6";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50 pb-12 pt-12 text-center rounded-b-[2rem] md:rounded-b-[4rem] shadow-sm md:pt-24 md:pb-24">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Badge */}
        <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-blue-100 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-default">
          <FaShieldHalved className="text-blue-600" />
          <span>100% Verified & Insured</span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Experts You Can Trust.
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {" "}Prices You'll Love.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg md:text-xl">
          Connect directly with local professionals and factories.{" "}
          <span className="block sm:inline font-semibold text-slate-900">
            <strong>No middleman markups. Guaranteed safety.</strong>
          </span>
        </p>

        {/* SEARCH SECTION */}
        <div className="mx-auto mb-16 max-w-2xl">
          {/* Input Wrapper */}
          {/* <div className="group relative flex items-center rounded-full border border-gray-200 bg-white p-1.5 shadow-lg transition-all focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 hover:shadow-xl">
            <div className="pl-4 text-gray-400 group-focus-within:text-blue-500">
              <FaMagnifyingGlass size={18} />
            </div>
            <input
              type="text"
              placeholder="What do you need help with?"
              className="w-full flex-grow bg-transparent px-4 py-3 text-base font-medium text-gray-700 placeholder-gray-400 focus:outline-none sm:text-lg"
              aria-label="Search services"
            />
            <button className="shrink-0 rounded-full bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-black active:scale-95 sm:px-8">
              Search
            </button>
          </div> */}

          {/* Popular Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              Popular:
            </span>
            {["Cleaning", "Plumbing", "Electronics"].map((tag, index) => (
              <button
                key={index}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:text-sm"
              >
                {tag === "Cleaning" && <FaArrowTrendUp className="text-blue-500" />}
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* STATISTICS BLOCK */}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-xl backdrop-blur-md md:p-10">
            <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">

              {/* Stat 1 */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                  500+
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Verified Experts
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                  10k+
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Transactions
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="flex items-center gap-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">
                  4.9 <FaStar className="text-yellow-400 text-3xl sm:text-4xl" />
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Average Rating
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}