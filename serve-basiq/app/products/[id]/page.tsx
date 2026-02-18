import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FaArrowLeft, FaLocationDot, FaStar,
  FaShieldHalved, FaBoxOpen, FaTruckFast,
  FaCircleCheck, FaStore, FaCube,
  FaInstagram, FaFacebook, FaYoutube, FaGlobe,
  FaLock
} from 'react-icons/fa6';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductWrapper from '@/components/products/ProductWrapper';
import AppImage from '@/components/ui/AppImage';
import SupplierProfileModal from '@/components/products/SupplierProfileModal';
import RatingForm from '@/components/Rating/RatingForm';

export const dynamic = "force-dynamic";

// ✅ HELPER: Detect Video Files
const isVideo = (url: string | null | undefined) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

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

  // 2. LOGIC: STRICT CHECK REVIEW ELIGIBILITY
  let canReview = false;

  if (session?.user?.id) {
    const userId = session.user.id;

    // A. User cannot review their own product
    if (product.userId !== userId) {

      // B. Check if User bought the product AND it is DELIVERED
      const hasDeliveredOrder = await prisma.order.findFirst({
        where: {
          userId: userId,
          productId: id,
          status: 'DELIVERED'
        }
      });

      // C. Check if User has already reviewed
      const existingReview = await prisma.review.findFirst({
        where: {
          authorId: userId,
          productId: id
        }
      });

      if (hasDeliveredOrder && !existingReview) {
        canReview = true;
      }
    }
  }

  // 3. FETCH LOGGED IN USER DATA (For Checkout/Wrapper)
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

  const ratingValue = calculatedRating;
  const reviewCount = product._count?.reviews || 0;

  const socials = [
    { icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
    { icon: <FaFacebook size={20} />, url: provider?.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
    { icon: <FaYoutube size={20} />, url: provider?.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
    { icon: <FaGlobe size={20} />, url: provider?.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
  ].filter(s => s.url);

  return (
    <div className="pb-40 bg-slate-50 min-h-screen">

      {/* --- HERO BANNER --- */}
      <div className="h-[40vh] md:h-[50vh] w-full bg-slate-900 relative overflow-hidden group">
        <AppImage
          src={mainImg}
          alt={product.name}
          type="banner"
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-slate-900/60"></div>

        {/* Back Button */}
        <Link href="/products" className="absolute top-6 left-6 md:top-8 md:left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-20">
          <FaArrowLeft />
        </Link>
      </div>

      {/* --- FLOATING CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - Main Info & Reviews */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">

            {/* 1. MAIN INFO CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-blue-600 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {product.category?.name || "Product"}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border ${isInStock ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      <span className={`w-2 h-2 rounded-full ${isInStock ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></span>
                      {isInStock ? `In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>

                  <p className="flex items-start gap-2 text-slate-500 mt-2 text-sm md:text-base">
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Min Order</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1 text-sm md:text-base">
                    <FaBoxOpen className="text-slate-400" /> {product.moq} {product.unit}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Delivery</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1 text-sm md:text-base">
                    <FaTruckFast className="text-slate-400" /> {product.deliveryType || "Standard"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Provider</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
                      {providerImage && <AppImage src={providerImage} alt="Sup" type="avatar" className="w-full h-full object-cover" />}
                    </div>
                    <p className="font-bold text-slate-900 text-xs md:text-sm truncate">{displayName}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Unit Type</p>
                  <div className="flex items-center gap-1 font-bold text-slate-900 mt-1 text-sm md:text-base">
                    <FaCube className="text-slate-400" /> {product.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GALLERY CARD (UPDATED FOR VIDEO) */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((mediaUrl, i) => (
                    <div key={i} className="aspect-square w-full relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      {isVideo(mediaUrl) ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AppImage
                          src={mediaUrl}
                          alt={`Gallery ${i}`}
                          type="gallery"
                          // Use containment for product images as they often have white backgrounds
                          className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition duration-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. REVIEWS CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Reviews</h3>
                <span className="text-xs md:text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{reviewCount} reviews</span>
              </div>

              {/* === RATING FORM OR ELIGIBILITY NOTICE === */}
              {canReview ? (
                <div className="mb-8 border border-blue-100 bg-blue-50/50 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                  <RatingForm productId={product.id} />
                </div>
              ) : (
                <div className="mb-8 p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center sticky top-4 z-10">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <FaBoxOpen />
                  </div>
                  <p className="text-slate-800 text-sm font-bold">Verified Purchase Only</p>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                    You can only leave a review after you have purchased this Product and it is marked as <strong>Delivered</strong>.
                  </p>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-100 shrink-0">
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
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FaStar className="mx-auto text-slate-300 text-3xl mb-2" />
                    <p className="text-slate-400 font-medium text-sm">No reviews yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div className="space-y-6 order-1 lg:order-2 h-fit lg:sticky lg:top-24 z-20">

            {/* PRICE & ACTION CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
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

              {/* Action Buttons */}
              <div className="mt-6">
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

            {/* SUPPLIER PROFILE CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FaStore className="text-slate-400" /> Supplier Profile
              </h4>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                  {providerImage ? (
                    <AppImage src={providerImage} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><FaStore /></div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h5 className="font-bold text-slate-900 leading-tight truncate">{displayName}</h5>
                  {isVerified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                      <FaCircleCheck /> Verified
                    </span>
                  )}
                </div>
              </div>
              <SupplierProfileModal supplier={product.user} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}