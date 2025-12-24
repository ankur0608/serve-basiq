import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  FaArrowLeft, FaCircleCheck, FaLocationDot, FaStar,
  FaShieldHalved, FaLock, FaGlobe, FaCheck
} from 'react-icons/fa6';
import Link from 'next/link';

// ✅ FIX: Type definition is now a Promise
interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetail({ params }: Props) {

  // ✅ FIX: Await the params object before accessing 'id'
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) return notFound();

  // 1. Fetch Real Data
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!service) return notFound();

  // 2. Parse JSON fields safely
  const social = service.social as any || {};

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">

      {/* ================= HERO IMAGE ================= */}
      <div className="h-72 md:h-96 bg-slate-900 relative group overflow-hidden">
        <img
          src={service.img}
          alt={service.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        <Link
          href="/services"
          className="absolute top-24 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 transition z-20"
        >
          <FaArrowLeft />
        </Link>
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
                <FaLocationDot className="text-blue-500" /> {service.loc}
              </p>

              <div className="flex gap-3">
                {social.website && <a href={social.website} target="_blank" className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition"><FaGlobe /></a>}
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-end gap-3">
              <div className="text-3xl font-extrabold text-blue-600">
                ₹{service.price}<span className="text-sm font-normal text-gray-400">/hr</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <span className="text-lg">{service.rating}</span>
                <FaStar />
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
                  {(service.gallery && service.gallery.length > 0 ? service.gallery : [service.img]).slice(0, 3).map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border border-gray-100">
                      <img src={img} alt="work" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Guarantee</h4>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3 items-center"><FaShieldHalved className="text-green-500" /> Verified Pro</li>
                  <li className="flex gap-3 items-center"><FaLock className="text-green-500" /> Secure Pay</li>
                  <li className="flex gap-3 items-center"><FaCheck className="text-green-500" /> Quality Service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center justify-between">
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