import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  FaArrowLeft, FaCircleCheck, FaLocationDot, FaStar,
  FaShieldHalved, FaLock, FaGlobe, FaCheck, FaPhone
} from 'react-icons/fa6';
import Link from 'next/link';

// ✅ Type definition
interface Props {
  params: Promise<{ id: string }>;
}

// Helper to format category codes (e.g., 'cat_cleaning' -> 'Cleaning')
const formatCategory = (cat: string | null) => {
  if (!cat) return "General";
  // Remove 'cat_' prefix and capitalize
  return cat.replace('cat_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default async function ServiceDetail({ params }: Props) {

  // ✅ Await the params object
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) return notFound();

  // 1. Fetch Real Data with User Relation
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      user: {
        select: {
          name: true,
          img: true,
          isVerified: true,
        }
      }
    }
  });

  if (!service) return notFound();

  // 2. Smart Data Handling (Fallbacks)
  const displayName = service.name || service.user?.name || "Service Provider";

  // Use service image as hero, fallback to user image, then placeholder
  const heroImage = service.img || service.user?.img || "https://via.placeholder.com/800x600?text=No+Image";

  // Location Logic
  const locationText = service.city
    ? `${service.city}${service.state ? `, ${service.state}` : ''}`
    : "Location N/A"; // Removed fallback to 'service.loc' if it doesn't exist on schema

  const isVerified = service.user?.isVerified || false;

  // ✅ FIX: Removed 'service.cat' fallback which caused the error
  const categoryName = formatCategory(service.categoryId);

  const ratingValue = Number(service.rating) || 0;
  const priceValue = Number(service.price) || 0;

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">

      {/* ================= HERO IMAGE ================= */}
      <div className="h-72 md:h-96 bg-slate-900 relative group overflow-hidden">
        <img
          src={heroImage}
          alt={displayName}
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

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-100 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{displayName}</h1>
                {isVerified && (
                  <FaCircleCheck className="text-blue-500 text-xl" title="Verified Provider" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
                  {categoryName}
                </span>
                <span className="flex items-center gap-1">
                  <FaLocationDot className="text-blue-500" /> {locationText}
                </span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-end gap-3">
              <div className="text-3xl font-extrabold text-blue-600">
                ₹{priceValue}<span className="text-sm font-normal text-gray-400">/hr</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <span className="text-lg">{ratingValue}</span>
                <FaStar />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-10">

              {/* Description */}
              <div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">About the Service</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {service.desc || "No description provided."}
                </p>
                {service.experience && (
                  <div className="mt-4 inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg border border-blue-100">
                    Experience: {service.experience}
                  </div>
                )}
              </div>

              {/* Gallery Section */}
              {service.gallery && service.gallery.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl mb-4 text-slate-900">Work Gallery</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {service.gallery.slice(0, 3).map((img, i) => (
                      <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border border-gray-100">
                        <img src={img} alt="work sample" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">

              {/* Guarantee Box */}
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Service Guarantee</h4>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3 items-center"><FaShieldHalved className="text-green-500" /> Identity Verified</li>
                  <li className="flex gap-3 items-center"><FaLock className="text-green-500" /> Secure Payment</li>
                  <li className="flex gap-3 items-center"><FaCheck className="text-green-500" /> 100% Satisfaction</li>
                </ul>
              </div>

              {/* Availability Mini-View (Optional) */}
              {service.workingDays && service.workingDays.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="font-bold text-sm mb-2 text-slate-900">Availability</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {service.openTime} - {service.closeTime}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <span key={day} className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full ${service.workingDays.includes(day) ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {day.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Booking Price</div>
            <div className="font-extrabold text-2xl text-slate-900 leading-none">₹{priceValue}</div>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center gap-2">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}