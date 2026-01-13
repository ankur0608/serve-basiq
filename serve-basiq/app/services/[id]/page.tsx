import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  FaArrowLeft, FaLocationDot, FaStar,
  FaShieldHalved, FaPhone,
  FaInstagram, FaFacebook, FaYoutube, FaGlobe
} from 'react-icons/fa6';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BookingWrapper from '@/components/booking/BookingWrapper';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetail({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Service Data
  const service = await prisma.service.findUnique({
    where: { id: id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          isVerified: true,
          phone: true,
          shopName: true,
        }
      },
      category: { select: { name: true } },
      reviews: { select: { id: true, rating: true } }
    }
  });

  if (!service) return notFound();

  // 2. Fetch Current Logged In User & Their Addresses
  const session = await getServerSession(authOptions);
  let currentUserAddresses: any[] = [];

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true }
    });
    if (user) currentUserAddresses = user.addresses;
  }

  // Model-Driven Constants
  const displayName = service.user.shopName || service.name;
  // Fallback image logic
  const heroImage = service.coverImg || service.serviceimg || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop";
  const ratingValue = Number(service.rating) || 5.0;

  // Social Links
  const socials = [
    { icon: <FaInstagram />, url: service.instagramUrl },
    { icon: <FaFacebook />, url: service.facebookUrl },
    { icon: <FaYoutube />, url: service.youtubeUrl },
    { icon: <FaGlobe />, url: service.websiteUrl },
  ].filter(s => s.url);

  return (
    <div className="pb-40 bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
      <div className="h-[40vh] md:h-[50vh] bg-slate-900 relative overflow-hidden">
        <img
          src={heroImage}
          alt={displayName}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
        <Link href="/services" className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition">
          <FaArrowLeft />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* MAIN CONTENT (Left Col) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                    {service.category?.name || "Service"}
                  </span>
                  <h1 className="text-4xl font-black text-slate-900 mt-3">{displayName}</h1>
                  <p className="flex items-center gap-2 text-slate-500 mt-2">
                    <FaLocationDot className="text-red-400" />
                    {service.addressLine1 ? `${service.addressLine1}, ${service.city}` : service.loc || "Location not specified"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                    <FaStar className="text-amber-500" />
                    <span className="font-bold text-slate-900">{ratingValue.toFixed(1)}</span>
                    <span className="text-slate-400 text-sm">({service.reviews.length})</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {service.desc}
                </p>
              </div>

              {/* Service Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Experience</p>
                  <p className="font-bold text-slate-900">{service.experience || 0}+ Years</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Service Area</p>
                  <p className="font-bold text-slate-900">{service.radiusKm || 10} km</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Verified</p>
                  <p className="font-bold text-slate-900">{service.isVerified ? 'Yes' : 'Pending'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Price Type</p>
                  <p className="font-bold text-slate-900">{service.priceType}</p>
                </div>
              </div>
            </div>

            {/* GALLERY */}
            {service.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Work Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.gallery.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Gallery ${i}`}
                      className="w-full h-48 object-cover rounded-2xl hover:opacity-90 transition cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (Right Col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 top-8 sticky">
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{service.price}</span>
                  <span className="text-slate-400 font-bold">{service.priceType === 'HOURLY' ? '/hour' : '/fixed'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaPhone size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Direct Contact</p>
                    <p className="text-sm font-bold text-slate-900">+91 {service.altPhone || service.user.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2">
                    <FaShieldHalved /> Safe Booking
                  </h4>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    <li>• Verified Professional</li>
                    <li>• No hidden charges</li>
                    <li>• Easy rescheduling</li>
                  </ul>
                </div>
              </div>

              {/* ✅ INTERACTIVE BOOKING BUTTON */}
              <BookingWrapper
                serviceId={service.id}
                serviceName={displayName!}
                price={service.price}
                currentUserId={session?.user?.id}
                userAddresses={currentUserAddresses}
              />

            </div>

            {/* AVAILABILITY */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Availability</h4>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500">Working Hours</span>
                <span className="font-bold text-slate-900">{service.openTime || '09:00 AM'} - {service.closeTime || '08:00 PM'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.workingDays.map(day => (
                  <span key={day} className="text-[10px] px-2 py-1 rounded-md font-bold bg-slate-900 text-white">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* SOCIALS */}
            {socials.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Social Presence</h4>
                <div className="flex gap-4">
                  {socials.map((social, i) => (
                    <a key={i} href={social.url!} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}