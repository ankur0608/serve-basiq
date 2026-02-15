import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FaArrowLeft, FaLocationDot, FaStar,
  FaShieldHalved, FaBoxOpen, FaTruckFast,
  FaCircleCheck, FaStore, FaRotateLeft, FaCube,
  FaInstagram, FaFacebook, FaYoutube, FaGlobe
} from 'react-icons/fa6';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductWrapper from '@/components/products/ProductWrapper';
import AppImage from '@/components/ui/AppImage';
import SupplierProfileModal from '@/components/products/SupplierProfileModal';

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;

  // 1. DATABASE FETCH
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      _count: { select: { reviews: true } },
      reviews: {
        include: {
          author: { select: { name: true, image: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      user: {
        select: {
          id: true, name: true, shopName: true, email: true, phone: true,
          isVerified: true, image: true, profileImage: true, createdAt: true,
          instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true,
          addresses: { where: { type: "Work" }, take: 1, select: { city: true, state: true, country: true } }
        }
      }
    }
  });

  if (!product) return notFound();

  const session = await getServerSession(authOptions);
  let loggedInUser = null;
  if (session?.user?.id) {
    loggedInUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true }
    });
  }

  // --- DATA PREPARATION ---
  const mainImg = product.productImage || (product.gallery && product.gallery[0]) || "https://images.unsplash.com/photo-1586769852044-692d6e3703f0";
  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [mainImg];

  const provider = product.user;
  const displayName = provider?.shopName || provider?.name || "Verified Supplier";
  const providerImage = provider?.profileImage || provider?.image;
  const isVerified = provider?.isVerified || false;
  const location = provider?.addresses[0]?.city || "India";

  const isInStock = product.stockStatus === 'IN_STOCK';

  const calculatedRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / product.reviews.length
    : 0;
  const ratingValue = (product as any).rating ? Number((product as any).rating) : calculatedRating;
  const reviewCount = product._count?.reviews || 0;

  const socials = [
    { icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
    { icon: <FaFacebook size={20} />, url: provider?.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
    { icon: <FaYoutube size={20} />, url: provider?.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
    { icon: <FaGlobe size={20} />, url: provider?.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
  ].filter(s => s.url);

  return (
    <div className="pb-40 bg-slate-50 min-h-screen">

      {/* --- HERO BANNER (Matches Service Page Image 1) --- */}
      <div className="h-[40vh] md:h-[50vh] w-full bg-slate-900 relative overflow-hidden">
        <AppImage
          src={mainImg}
          alt={product.name}
          type="banner"
          className="w-full h-full object-cover opacity-80"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-slate-900/60"></div>

        {/* Back Button */}
        <Link href="/products" className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-20">
          <FaArrowLeft />
        </Link>
      </div>

      {/* --- FLOATING CONTENT (Matches Service Page Image 2 & 3) --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. MAIN INFO CARD */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {product.category?.name || "Product"}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${isInStock ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      <span className={`w-2 h-2 rounded-full ${isInStock ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></span>
                      {isInStock ? `In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>

                  <p className="flex items-start gap-2 text-slate-500 mt-2">
                    <FaLocationDot className="text-red-400 mt-1 shrink-0" />
                    <span className="leading-relaxed font-medium">{location}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                    <FaStar className="text-amber-500" />
                    <span className="font-bold text-slate-900">{ratingValue.toFixed(1)}</span>
                    <span className="text-slate-400 text-sm">({reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Socials Section */}
              {socials.length > 0 && (
                <div className="mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Professional Socials</h4>
                  <div className="flex gap-3">
                    {socials.map((social, i) => (
                      <a key={i} href={social.url!} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-1 ${social.styleClass}`}>
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.desc}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Min Order</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1">
                    <FaBoxOpen className="text-slate-400" /> {product.moq} {product.unit}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Delivery</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1">
                    <FaTruckFast className="text-slate-400" /> {product.deliveryType || "Standard"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Provider</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 relative">
                      {providerImage && <AppImage src={providerImage} alt="Sup" type="avatar" className="w-full h-full object-cover" />}
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate max-w-[80px]">{displayName}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Unit Type</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1">
                    <FaCube className="text-slate-400" /> {product.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GALLERY CARD */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="h-48 w-full relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      <AppImage
                        src={img}
                        alt={`Gallery ${i}`}
                        type="gallery"
                        className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. REVIEWS CARD */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Reviews & Ratings</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-100">
                          <AppImage src={review.author?.image || ""} alt="User" type="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{review.author?.name || "Customer"}</p>
                          <div className="flex text-amber-500 text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < review.rating ? "fill-current" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">No reviews yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div className="space-y-6">

            {/* PRICE & ACTION CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 top-24 z-20">
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
                  <span className="text-slate-400 font-bold">/ {product.unit}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">+ GST if applicable</p>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2"><FaShieldHalved /> Safe Booking</h4>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    <li>• Verified Professional</li>
                    <li>• No hidden charges</li>
                    <li>• Secure Platform</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SUPPLIER PROFILE CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FaStore className="text-slate-400" /> Supplier Profile
              </h4>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden relative">
                  {providerImage ? (
                    <AppImage src={providerImage} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><FaStore /></div>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 leading-tight">{displayName}</h5>
                  {isVerified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                      <FaCircleCheck /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div>
                <SupplierProfileModal supplier={product.user} /></div>

            </div>
            {/* Action Buttons */}
            <ProductWrapper
              productId={product.id}
              productName={product.name}
              productPrice={Number(product.price)}
              productUnit={product.unit}
              moq={Number(product.moq)}
              currentUser={loggedInUser}
              userAddresses={loggedInUser?.addresses || []}
            />

          </div>

        </div>
      </div>
    </div>
  );
}