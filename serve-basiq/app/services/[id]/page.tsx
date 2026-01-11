import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  FaArrowLeft, FaCircleCheck, FaLocationDot, FaStar,
  FaShieldHalved, FaLock, FaCheck, FaPhone, FaCalendarCheck
} from 'react-icons/fa6';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

const formatCategory = (cat: string | null) => {
  if (!cat) return "General";
  return cat.replace('cat_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default async function ServiceDetail({ params }: Props) {
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) return notFound();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      user: {
        select: {
          name: true,
          img: true,
          isVerified: true,
          phone: true,
          shopName: true, // ✅ Fetch User's Shop Name as fallback
        }
      },
      reviews: {
        select: { id: true, rating: true }
      }
    }
  });

  if (!service) return notFound();

  // ✅ PRIORITY: Service Shop Name -> User Shop Name -> Service Name -> User Name
  const displayName = service.user.shopName || service.user?.shopName || service.name || service.user?.name || "Service Provider";

  const providerName = service.user?.name || "Verified Provider";
  const heroImage = service.coverImg || service.img || service.user?.img || "https://via.placeholder.com/800x600?text=No+Image";

  const locationText = service.city
    ? `${service.city}${service.state ? `, ${service.state}` : ''}`
    : "Location N/A";

  const isVerified = service.user?.isVerified || false;
  const categoryName = formatCategory(service.categoryId);
  const ratingValue = Number(service.rating) || 0;
  const priceValue = Number(service.price) || 0;
  const reviewCount = service.reviews.length;

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="h-72 md:h-96 bg-slate-900 relative group overflow-hidden">
        <img
          src={heroImage}
          alt={displayName}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <Link
          href="/services"
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 transition z-20 border border-white/20"
        >
          <FaArrowLeft />
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          <div className="p-6 md:p-10 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {displayName}
                  </h1>
                  {isVerified && <FaCircleCheck className="text-blue-500 text-2xl flex-shrink-0" title="Verified" />}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 mb-4">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase text-xs tracking-wide">
                    {categoryName}
                  </span>
                  <span className="flex items-center gap-1.5 px-2">
                    <FaLocationDot className="text-gray-400" /> {locationText}
                  </span>
                  {service.user?.phone && (
                    <span className="flex items-center gap-1.5 px-2 border-l border-gray-200 pl-4">
                      <FaPhone className="text-gray-400" /> +91 ********{service.user.phone.slice(-2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <FaStar />
                    <span className="text-slate-900 font-bold text-lg">{ratingValue}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({reviewCount} reviews)</span>
                </div>
              </div>

              <div className="hidden md:block text-right">
                <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Starting From</div>
                <div className="text-4xl font-extrabold text-slate-900">
                  ₹{priceValue}
                  <span className="text-lg text-gray-400 font-medium ml-1">
                    {service.priceType === 'HOURLY' ? '/hr' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="md:col-span-2 p-6 md:p-10 space-y-10">
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span> About This Service
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {service.desc || "No detailed description provided."}
                </p>

                <div className="mt-6 flex gap-4">
                  {service.experience && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100 text-sm font-bold flex flex-col">
                      <span className="text-[10px] uppercase text-blue-400 mb-0.5">Experience</span>
                      {service.experience}+ Years
                    </div>
                  )}
                  <div className="bg-slate-50 text-slate-700 px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 mb-0.5">Provider</span>
                    {providerName}
                  </div>
                </div>
              </div>

              {service.gallery && service.gallery.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span> Recent Work
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {service.gallery.map((img, i) => (
                      <div key={i} className="aspect-square relative rounded-xl overflow-hidden group bg-gray-100 cursor-pointer">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-10 space-y-8 bg-slate-50/50">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Service Guarantee</h4>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3 items-center"><FaShieldHalved className="text-emerald-500 text-lg" /> Identity Verified</li>
                  <li className="flex gap-3 items-center"><FaLock className="text-emerald-500 text-lg" /> Secure Payment</li>
                  <li className="flex gap-3 items-center"><FaCheck className="text-emerald-500 text-lg" /> 100% Satisfaction</li>
                </ul>
              </div>

              {service.workingDays && service.workingDays.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Availability</h4>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                      <div className="text-xs text-gray-400 font-bold uppercase">Open Hours</div>
                      <div className="text-sm font-bold text-slate-900">{service.openTime || "09:00"} - {service.closeTime || "18:00"}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <span key={day} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${service.workingDays.includes(day) ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}>
                          {day.charAt(0)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 flex justify-center pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center justify-between ring-1 ring-white/20">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Price</div>
            <div className="font-extrabold text-2xl text-white leading-none">
              ₹{priceValue}
              {service.priceType === 'HOURLY' && <span className="text-sm font-normal text-slate-400 ml-1">/hr</span>}
            </div>
          </div>
          <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-2">
            <FaCalendarCheck /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}