"use client";

import Link from 'next/link';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaShieldHalved, FaPhone,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe,
    FaCircleCheck, FaLock, FaTags, FaBoxOpen,
    FaTruckFast, FaCube, FaStore
} from 'react-icons/fa6';
import BookingWrapper from '@/components/booking/BookingWrapper';
import AppImage from '@/components/ui/AppImage';
import RatingForm from '@/components/Rating/RatingForm';
import { Session } from 'next-auth';
import { useServicePageData } from '@/app/hook/useServicePageData';
import AppVideo from '../ui/AppVideo';
import ProductSlider from '@/components/products/ProductSlider';
import InteractiveProductGallery from '@/components/products/InteractiveGallery';
import SupplierProfileModal from '@/components/products/SupplierProfileModal';

const isVideo = (url: string | null | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

interface ServiceDetailViewProps {
    service: {
        id: string;
        name: string;
        desc: string;
        price: number;
        priceType: string;
        coverImg?: string | null;
        serviceimg?: string | null;
        rentalImg?: string | null;
        mainimg?: string | null;
        serviceImages?: string[];
        rentalImages?: string[];
        rating: number | string;
        instagramUrl?: string | null;
        facebookUrl?: string | null;
        youtubeUrl?: string | null;
        websiteUrl?: string | null;
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
        landmark?: string | null;
        loc?: string | null;
        experience?: string | number | null;
        radiusKm?: number | null;
        isVerified?: boolean;
        altPhone?: string | null;
        workingDays: string[];
        openTime?: string | null;
        closeTime?: string | null;
        is24x7?: boolean; // ✅ FIX 1: Added to interface to fix TypeScript error
        gallery: string[];
        user: {
            id: string;
            name?: string | null;
            image?: string | null;
            profileImage?: string | null;
            phone?: string | null;
            shopName?: string | null;
            isVerified?: boolean;
            instagramUrl?: string | null;
            facebookUrl?: string | null;
            youtubeUrl?: string | null;
            websiteUrl?: string | null;
        };
        category: { name: string } | null;
        subcategory?: { name: string } | null;
        reviews: any[];
    };
    loggedInUser: any;
    session: Session | null;
    relatedServices?: any[];
}

export default function ServiceDetailView({ service, loggedInUser: initialUser, session, relatedServices = [] }: ServiceDetailViewProps) {
    const displayName = service.user.shopName || service.name;

    const { currentUser, eligibility, isEligibilityLoading } = useServicePageData({
        serviceId: service.id,
        initialUser,
        session
    });

    const providerImage = service.user.profileImage || service.user.image || "";
    const ratingValue = Number(service.rating) || 5.0;
    const isVerified = service.isVerified || service.user.isVerified;

    const addressParts = [
        service.addressLine1,
        service.addressLine2,
        service.landmark ? `Near ${service.landmark}` : null,
        service.city,
        service.state ? `${service.state}` : null
    ].filter(Boolean);

    let fullAddress = addressParts.join(', ');
    if (service.pincode) fullAddress += ` - ${service.pincode}`;
    if (!fullAddress && service.loc) fullAddress = service.loc;
    if (!fullAddress) fullAddress = "Location not specified";

    const socials = [
        { name: 'Instagram', icon: <FaInstagram size={20} />, url: service.instagramUrl || service.user.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
        { name: 'Facebook', icon: <FaFacebook size={20} />, url: service.facebookUrl || service.user.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
        { name: 'YouTube', icon: <FaYoutube size={20} />, url: service.youtubeUrl || service.user.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
        { name: 'Website', icon: <FaGlobe size={20} />, url: service.websiteUrl || service.user.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
    ].filter(s => s.url && s.url.trim() !== "" && s.url !== "null");

    const formattedRelatedServices = relatedServices.map((s) => ({
        id: s.id,
        name: s.name || s.user?.shopName || 'Service',
        price: s.price || 0,
        unit: s.priceType === 'HOURLY' ? 'hour' : 'fixed',
        productImage: (s.serviceImages && s.serviceImages.length > 0) ? s.serviceImages[0] : (s.coverImg || s.serviceimg || s.mainimg || null),
        gallery: Array.isArray(s.gallery) ? s.gallery : [],
        category: s.category,
        listingType: 'SERVICE' as const,
        ownerLocation: s.city || s.loc || 'Location not specified'
    }));

    const allImages = Array.from(new Set([
        service.serviceimg || service.rentalImg || service.mainimg,
        ...(service.serviceImages || service.rentalImages || []),
        ...(service.gallery || [])
    ])).filter(Boolean) as string[];

    if (allImages.length === 0) {
        allImages.push("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop");
    }

    const mainImg = allImages[0];

    return (
        <div className="pb-20 bg-slate-50 min-h-screen pt-4 md:pt-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* 1. BACK BUTTON */}
                <div className="mb-6">
                    <Link href="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <FaArrowLeft /> Back to services
                    </Link>
                </div>

                {/* 2. TITLE ROW - FULL WIDTH AT THE TOP */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="w-full md:w-auto">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                            <span className="text-blue-600 text-[10px] md:text-xs font-bold uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                {service.category?.name || "Service"}
                                {service.subcategory?.name && ` • ${service.subcategory.name}`}
                            </span>
                            {isVerified && (
                                <span className="flex items-center gap-1 text-emerald-600 text-[10px] md:text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                    <FaCircleCheck /> Verified
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">{displayName}</h1>
                        <p className="flex items-start gap-2 text-slate-500 mt-2 text-sm md:text-base font-medium">
                            <FaLocationDot className="text-red-400 mt-1 shrink-0" />
                            <span>{fullAddress}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center border-r border-slate-100 pr-4">
                            <div className="flex items-center gap-1 text-amber-500">
                                <FaStar />
                                <span className="font-bold text-slate-900 text-lg">{ratingValue.toFixed(1)}</span>
                            </div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Rating</span>
                        </div>
                        <div className="flex flex-col items-center pl-1">
                            <span className="font-bold text-slate-900 text-lg">{service.reviews?.length || 0}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Reviews</span>
                        </div>
                    </div>
                </div>

                {/* 3. CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">

                        {/* Interactive Gallery */}
                        <InteractiveProductGallery
                            mainProductImage={mainImg}
                            productImages={allImages.slice(1)}
                            productName={displayName}
                        />

                        {/* Main Description Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <div className="border-b border-slate-100 pb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Service Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{service.desc}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Experience</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaBoxOpen className="text-slate-300" /> {service.experience || 0}+ Yrs</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Area</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaTruckFast className="text-slate-300" /> {service.radiusKm || 10} km</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Billing</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaCube className="text-slate-300" /> {service.priceType}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                                    <p className="font-bold text-slate-900 truncate uppercase">
                                        {service.is24x7 ? "24x7 Open" : "Standard"}
                                    </p>
                                </div>
                            </div>

                            {/* Socials */}
                            {socials.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider">Connect with Provider</h4>
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

                        {/* Full Gallery Section */}
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

                        {/* Review Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8">Customer Reviews</h3>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                                    {service.reviews.length > 0 ? (
                                        service.reviews.map((review) => (
                                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 relative">
                                                        <AppImage src={review.author.image || ""} alt={review.author.name || "User"} type="avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{review.author.name || "Customer"}</p>
                                                        <div className="flex text-amber-500 text-[10px]">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < review.rating ? "fill-current" : "text-slate-200"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm italic mb-3">"{review.comment}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <FaStar className="mx-auto text-slate-300 text-3xl mb-2" />
                                            <p className="text-slate-400 font-medium text-sm mt-2">No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {!session ? null : isEligibilityLoading ? <p>Loading...</p> : eligibility?.canReview ? <RatingForm serviceId={service.id} /> : (
                                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center sticky top-24">
                                            <FaLock className="mx-auto text-slate-400 text-2xl mb-2" />
                                            <p className="text-slate-800 text-sm font-bold">Verified Booking Only</p>
                                            <p className="text-slate-500 text-xs mt-2">Book the service and mark as complete to leave a review.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN ================= */}
                    <div className="space-y-6 order-1 lg:order-2 h-fit lg:sticky lg:top-24 z-20">

                        {/* Pricing & Booking Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <div className="mb-6">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Starting at</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-4xl font-black text-slate-900">₹{Number(service.price).toLocaleString()}</span>
                                    <span className="text-slate-400 font-bold">{service.priceType === 'HOURLY' ? '/hour' : '/fixed'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <FaPhone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Direct Contact</p>
                                        <p className="text-sm font-bold text-slate-900">Connect with Provider</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2"><FaShieldHalved /> Safe Booking</h4>
                                    <ul className="text-xs text-emerald-700 space-y-1">
                                        <li>• Verified Professional</li>
                                        <li>• No hidden charges</li>
                                        <li>• Secure Platform</li>
                                    </ul>
                                </div>
                            </div>

                            <BookingWrapper
                                serviceId={service.id}
                                serviceName={displayName!}
                                price={service.price}
                                currentUser={currentUser}
                                userAddresses={currentUser?.addresses || []}
                            />
                        </div>

                        {/* Availability Info */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                Business Hours
                            </h4>

                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-slate-500 font-medium uppercase text-[10px]">Status</span>
                                <span className={`font-black ${service.is24x7 ? 'text-green-600' : 'text-slate-900'}`}>
                                    {service.is24x7 ? 'OPEN 24/7' : `${service.openTime} - ${service.closeTime}`}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {service.is24x7 ? (
                                    // ✅ Show "Every Day" badge if 24x7 is true
                                    <span className="text-[10px] px-3 py-1.5 rounded-lg font-bold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                                        <FaCircleCheck size={10} /> Every Day (Monday - Sunday)
                                    </span>
                                ) : (
                                    // ✅ Show specific days if not 24x7
                                    service.workingDays && service.workingDays.length > 0 ? (
                                        service.workingDays.map((day: string) => (
                                            <span key={day} className="text-[10px] px-2 py-1 rounded-md font-bold bg-slate-900 text-white shadow-sm">
                                                {day}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic font-medium">Days not specified</span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Supplier Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <FaStore className="text-slate-400" /> Supplier Profile
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                                    <AppImage src={providerImage} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="font-bold text-slate-900 leading-tight truncate">{service.user.name}</h5>
                                    {isVerified && (
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                                            <FaCircleCheck /> Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                            <SupplierProfileModal supplier={service.user} />
                        </div>
                    </div>
                </div>

                {formattedRelatedServices.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-200">
                        <ProductSlider title="Related Services" products={formattedRelatedServices} currentUser={currentUser} />
                    </div>
                )}
            </div>
        </div>
    );
}