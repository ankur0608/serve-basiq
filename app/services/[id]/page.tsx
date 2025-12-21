'use client'; // Try removing this line if you get errors, but keep it for now if using useState

import { useRouter } from 'next/navigation';
import { services } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  FaArrowLeft, FaHeart, FaRegHeart, FaCircleCheck,
  FaLocationDot, FaStar, FaShieldHalved, FaHandHoldingDollar, FaLock,
  FaGlobe, FaFacebookF, FaInstagram
} from 'react-icons/fa6';
import { useState, use } from 'react'; // Import 'use' hook for Next.js 15 unwrapping

// Next.js 15 Definition: params is a Promise
export default function ServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  // 1. Unwrap params using the React 'use' hook (Standard for Next.js 15 client components)
  // If you are on an older version, just use: const { id } = params;
  const { id } = use(params);

  // 2. Debugging Logs (Check your VS Code Terminal when you refresh!)
  console.log("--- DEBUGGING ---");
  console.log("Requested ID from URL:", id);

  const serviceId = parseInt(id);
  const service = services.find(s => s.id === serviceId);

  console.log("Found Service:", service ? service.name : "None");

  // 3. If NOT found, this triggers the 404 page you are seeing
  if (!service) {
    return notFound();
  }

  const [isFav, setIsFav] = useState(false);

  // Find similar services
  const similarServices = services
    .filter(s => s.cat === service.cat && s.id !== service.id)
    .slice(0, 4);

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">

      {/* ================= HERO IMAGE ================= */}
      <div className="h-72 md:h-96 bg-slate-900 relative group overflow-hidden">
        <img
          src={service.img}
          alt={service.name}
          // fill
          className="object-cover opacity-80"
          // priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        <button
          onClick={() => router.back()}
          className="absolute top-24 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 transition z-20"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={() => setIsFav(!isFav)}
          className="absolute top-24 right-4 md:top-8 md:right-8 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition z-20"
        >
          {isFav ? <FaHeart className="text-white" /> : <FaRegHeart />}
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-100 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{service.name}</h1>
                {service.verified && (
                  <FaCircleCheck className="text-blue-500 text-xl" title="Verified Provider" />
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                <FaLocationDot className="text-brand-500" /> {service.loc} &bull; 5.0km away
              </p>

              <div className="flex gap-3">
                {service.social?.web && <a href={service.social.web} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition"><FaGlobe /></a>}
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-end gap-3">
              <div className="text-3xl font-extrabold text-brand-600">
                ₹{service.price}<span className="text-sm font-normal text-gray-400">/hr</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <span className="text-lg">{service.rating}</span>
                <FaStar />
                <span className="text-gray-400 font-normal ml-1 border-l border-gray-300 pl-2 text-xs uppercase tracking-wide">
                  {service.reviews.length} Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
              <div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{service.desc}</p>
              </div>

              {/* Gallery Section */}
              <div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">Work Gallery</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(service.gallery && service.gallery.length > 0 ? service.gallery : [service.img, service.img]).slice(0, 3).map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-xl overflow-hidden group">
                      <img src={img} alt="work" className="object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-brand-50/50 rounded-2xl p-6 border border-brand-100">
                <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Guarantee</h4>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3 items-center"><FaShieldHalved className="text-green-500" /> Verified Pro</li>
                  <li className="flex gap-3 items-center"><FaLock className="text-green-500" /> Secure Pay</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-up rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Estimated Total</div>
            <div className="font-extrabold text-2xl text-slate-900 leading-none">₹{service.price}</div>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}