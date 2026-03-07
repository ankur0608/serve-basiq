"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaShieldHalved, FaPhone,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe,
    FaCircleCheck, FaBoxOpen, FaClock, FaLock,
    FaStore
} from 'react-icons/fa6';
import { Session } from "next-auth";
import AppImage from '@/components/ui/AppImage';
import { useListingPageData } from '@/app/hook/useListingPageData';

// 🚀 Lazy load heavy components
const RentalBookingWrapper = dynamic(() => import('@/components/Rental/RentalBookingWrapper'), { ssr: false });
const ProductSlider = dynamic(() => import('@/components/products/ProductSlider'), { ssr: false });
const InteractiveGallery = dynamic(() => import('../products/InteractiveGallery'), { ssr: false });
const SupplierProfileModal = dynamic(() => import('../products/SupplierProfileModal'), { ssr: false });
const RatingForm = dynamic(() => import('@/components/Rating/RatingForm'), { ssr: false });
const AppVideo = dynamic(() => import('../ui/AppVideo'), { ssr: false });

// ✅ HELPER: Detect Video Files
const isVideo = (url: string | null | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

// ✅ HELPER: Format Enum text
const formatEnum = (str?: string) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, ' ');
};

interface Props {
    rental: any;
    relatedRentals: any[];
    session: Session | null;
    loggedInUser: any;
}

export default function RentalDetailsContent({ rental, relatedRentals, session, loggedInUser: initialUser }: Props) {

    // 🚀 Uses our unified hook for eligibility and live user data
    const { currentUser, eligibility, isEligibilityLoading } = useListingPageData({
        itemId: rental.id,
        listingType: 'RENTAL',
        initialUser,
        session
    });

    const provider = rental.user;
    const displayName = rental.name;
    const isVerified = rental.isVerified || provider?.isVerified;

    // Address Logic
    const addressParts = [rental.addressLine1, rental.addressLine2, rental.city, rental.state].filter(Boolean);
    let fullAddress = addressParts.join(', ');
    if (rental.pincode) fullAddress += ` - ${rental.pincode}`;
    if (!fullAddress) fullAddress = "Location available upon booking";

    // Ratings
    const calculatedRating = rental.reviews?.length > 0
        ? rental.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / rental.reviews.length
        : 5.0;

    const allImages = Array.from(new Set([
        rental.coverImg || rental.rentalImg,
        ...(rental.gallery || [])
    ])).filter(Boolean) as string[];

    if (allImages.length === 0) {
        allImages.push("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop");
    }

    const socials = [
        { icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
        { icon: <FaFacebook size={20} />, url: provider?.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
        { icon: <FaYoutube size={20} />, url: provider?.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
        { icon: <FaGlobe size={20} />, url: provider?.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
    ].filter(s => s.url && s.url !== "null");

    return (
        <div className="pb-40 bg-slate-50 min-h-screen pt-4 md:pt-8 scroll-smooth">
            <div className="max-w-7xl mx-auto px-4">

                <div className="mb-6">
                    <Link href="/rentals" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <FaArrowLeft /> Back to rentals
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ================= LEFT COLUMN ================= */}
                    <div className="lg:col-span-2 space-y-8 order-1">
                        <div>
                            <div className="flex flex-wrap items-center justify-start gap-4">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                                    {displayName}
                                </h1>

                                <div className="flex items-center gap-2 bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0 w-fit">
                                    <FaStar className="text-amber-500 text-lg md:text-xl" />
                                    <span className="font-black text-slate-900 text-lg md:text-xl leading-none">{calculatedRating.toFixed(1)}</span>
                                    <span className="text-slate-300 mx-1">|</span>
                                    <a href="#reviews" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                        ({rental.reviews?.length || 0} Reviews)
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mt-4 text-sm md:text-base font-medium text-slate-600">
                                <FaLocationDot className="text-red-400 text-lg shrink-0 mt-0.5" />
                                <span>{fullAddress}</span>
                            </div>
                        </div>

                        <InteractiveGallery
                            mainProductImage={allImages[0]}
                            productImages={allImages.slice(1)}
                            productName={displayName}
                        />

                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <div className="border-b border-slate-100 pb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Item Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{rental.desc}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Condition</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaBoxOpen className="text-slate-300" /> {formatEnum(rental.itemCondition)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Min. Duration</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaClock className="text-slate-300" /> {rental.minDuration || 1} {formatEnum(rental.priceType)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Deposit</p>
                                    <p className="font-bold text-slate-900">₹{rental.securityDeposit || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Owner</p>
                                    <p className="font-bold text-slate-900 truncate">{provider?.shopName || provider?.name}</p>
                                </div>
                            </div>

                            {socials.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider">Connect with Owner</h4>
                                    <div className="flex gap-3">
                                        {socials.map((social, i) => (
                                            <a key={i} href={social.url!} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-1 ${social.styleClass}`}>
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🚀 Added Full Media Gallery with AppVideo support */}
                        {allImages.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200" id="Gallery">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Gallery Media</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {allImages.map((mediaUrl, i) => (
                                        <div key={i} className="aspect-square w-full relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer">
                                            {isVideo(mediaUrl) ? (
                                                <AppVideo src={mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <AppImage
                                                    src={mediaUrl}
                                                    alt={`Gallery ${i}`}
                                                    type="gallery"
                                                    className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition duration-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div id="reviews" className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 scroll-mt-24">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8">User Reviews</h3>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                                    {rental.reviews?.length > 0 ? (
                                        rental.reviews.map((review: any) => (
                                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden relative"><AppImage src={review.author.image || ""} alt="User" type="avatar" className="w-full h-full object-cover" /></div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{review.author.name}</p>
                                                        <div className="flex text-amber-500 text-[10px]">
                                                            {[...Array(5)].map((_, i) => (<FaStar key={i} className={i < review.rating ? "fill-current" : "text-slate-200"} />))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic text-sm py-8 text-center">No reviews yet.</p>
                                    )}
                                </div>
                                <div>
                                    {/* 🚀 Uses proper Eligibility checking from the hook */}
                                    {!session ? null : isEligibilityLoading ? <p>Loading...</p> : eligibility?.canReview ? (
                                        <RatingForm rentalId={rental.id} type="RENTAL" />
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center top-24">
                                            <FaLock className="mx-auto text-slate-400 text-2xl mb-2" />
                                            <p className="text-slate-800 text-sm font-bold">Verified Rental Only</p>
                                            <p className="text-slate-500 text-xs mt-2">Complete a rental period to leave a review.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN (Pricing & Booking) ================= */}
                    <div className="space-y-6 order-2 h-fit lg:top-24 z-20">
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <div className="flex items-center flex-wrap gap-2 mb-6">
                                <span className="text-blue-600 text-[10px] md:text-xs font-bold uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {rental.category?.name || "Rental"}
                                    {rental.subcategory?.name && ` • ${rental.subcategory.name}`}
                                </span>
                                {isVerified && (
                                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] md:text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                        <FaCircleCheck /> Verified
                                    </span>
                                )}
                            </div>

                            <div className="mb-6 pb-6 border-b border-slate-100">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Rental Starts At</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-5xl font-black text-slate-900">₹{rental.price}</span>
                                    <span className="text-slate-400 font-bold text-lg">/{formatEnum(rental.priceType)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2"><FaShieldHalved /> Safe Rental</h4>
                                    <ul className="text-xs text-emerald-700 space-y-1">
                                        <li>• Verified Item Condition</li>
                                        <li>• Secure Escrow Payments</li>
                                        <li>• 24/7 Platform Support</li>
                                    </ul>
                                </div>
                            </div>

                            <RentalBookingWrapper
                                rentalId={rental.id}
                                rentalName={displayName}
                                rentalImage={allImages[0]}
                                ownerLocation={fullAddress}
                                price={rental.price}
                                hourlyPrice={rental.hourlyPrice}
                                dailyPrice={rental.dailyPrice}
                                weeklyPrice={rental.weeklyPrice}
                                monthlyPrice={rental.monthlyPrice}
                                fixedPrice={rental.fixedPrice}
                                currentUser={currentUser}
                                userAddresses={currentUser?.addresses || []}
                            />
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <FaStore className="text-slate-400" /> Owner Details
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                                    <AppImage src={rental.user.profileImage || rental.user.image || ""} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="font-bold text-slate-900 leading-tight truncate">{rental.user.shopName || rental.user.name}</h5>
                                    {isVerified && (
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                                            <FaCircleCheck /> Verified Owner
                                        </span>
                                    )}
                                </div>
                            </div>
                            <SupplierProfileModal supplier={rental.user} />
                        </div>
                    </div>
                </div>

                {relatedRentals.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-200">
                        <ProductSlider title="More Rentals You Might Like" products={relatedRentals} currentUser={currentUser} />
                    </div>
                )}
            </div>
        </div>
    );
}