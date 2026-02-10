"use client";

import Link from 'next/link';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaShieldHalved, FaPhone,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe,
    FaCircleCheck
} from 'react-icons/fa6';
import BookingWrapper from '@/components/booking/BookingWrapper';
import AppImage from '@/components/ui/AppImage';
import RatingForm from '@/components/Rating/RatingForm';
import { Session } from 'next-auth';

interface ServiceDetailViewProps {
    service: {
        id: string;
        name: string;
        desc: string;
        price: number;
        priceType: string;
        
        // Image Fields (Checking all possible keys from API)
        coverImg?: string | null;
        serviceimg?: string | null;
        rentalImg?: string | null;
        mainimg?: string | null;
        
        rating: number | string;

        // Socials
        instagramUrl?: string | null;
        facebookUrl?: string | null;
        youtubeUrl?: string | null;
        websiteUrl?: string | null;

        // Address Fields
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
        subcategory?: { name: string } | null; // Added Subcategory
        reviews: any[];
    };
    loggedInUser: any;
    session: Session | null;
}

export default function ServiceDetailView({ service, loggedInUser, session }: ServiceDetailViewProps) {
    const displayName = service.user.shopName || service.name;

    // ✅ IMPROVED IMAGE LOGIC: Check all possible image fields for the Hero Section
    const heroImage = 
        service.coverImg || 
        service.serviceimg || 
        service.rentalImg || 
        service.mainimg || 
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop";

    const providerImage = service.user.profileImage || service.user.image || "";
    const ratingValue = Number(service.rating) || 5.0;
    const isVerified = service.isVerified || service.user.isVerified;

    // ✅ ADDRESS FORMATTING
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

    return (
        <div className="pb-40 bg-slate-50 min-h-screen">
            {/* HERO SECTION */}
            <div className="h-[40vh] md:h-[50vh] bg-slate-900 relative overflow-hidden">
                <AppImage 
                    src={heroImage} 
                    alt={displayName} 
                    type="banner" 
                    className="w-full h-full object-cover opacity-80" 
                    priority={true} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
                <Link href="/services" className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-20">
                    <FaArrowLeft />
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* MAIN INFO CARD */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                                            {service.category?.name || "Service"}
                                            {service.subcategory?.name && ` • ${service.subcategory.name}`}
                                        </span>
                                        {isVerified && (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                                <FaCircleCheck /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-black text-slate-900">{displayName}</h1>
                                    <p className="flex items-start gap-2 text-slate-500 mt-2">
                                        <FaLocationDot className="text-red-400 mt-1 shrink-0" />
                                        <span className="leading-relaxed">{fullAddress}</span>
                                    </p>
                                </div>
                                
                                {/* Ratings Badge */}
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                                        <FaStar className="text-amber-500" />
                                        <span className="font-bold text-slate-900">{ratingValue.toFixed(1)}</span>
                                        <span className="text-slate-400 text-sm">({service.reviews.length})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Socials Connection */}
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

                            <div className="border-t border-slate-100 pt-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{service.desc}</p>
                            </div>

                            {/* Stats Grid */}
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
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Provider</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 relative">
                                            {providerImage && <AppImage src={providerImage} alt="Provider" type="avatar" className="w-full h-full object-cover" />}
                                        </div>
                                        <p className="font-bold text-slate-900 text-xs truncate max-w-[80px]">{service.user.name}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Billing</p>
                                    <p className="font-bold text-slate-900">{service.priceType}</p>
                                </div>
                            </div>
                        </div>

                        {/* GALLERY SECTION */}
                        {service.gallery && service.gallery.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Work Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {service.gallery.map((img, i) => (
                                        <div key={i} className="h-48 w-full relative group">
                                            <AppImage 
                                                src={img} 
                                                alt={`Gallery ${i}`} 
                                                type="gallery" 
                                                className="w-full h-full object-cover rounded-2xl group-hover:opacity-90 transition cursor-pointer" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* REVIEWS & REVIEW IMAGES SECTION */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Reviews & Ratings</h3>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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

                                                {/* ✅ Review Attached Images */}
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                        {review.images.map((img: string, idx: number) => (
                                                            <div key={idx} className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative hover:scale-105 transition-transform">
                                                                <AppImage
                                                                    src={img}
                                                                    alt={`Review attachment ${idx}`}
                                                                    type="gallery"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">No reviews yet.</p>
                                    )}
                                </div>

                                <div>
                                    {session ? <RatingForm serviceId={service.id} /> : (
                                        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center sticky top-24">
                                            <p className="text-blue-800 text-sm font-medium">Log in to rate this service.</p>
                                            <Link href="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                                                Login Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR SECTION */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4">Availability</h4>
                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-slate-500">Working Hours</span>
                                <span className="font-bold text-slate-900">{service.openTime || '09:00 AM'} - {service.closeTime || '08:00 PM'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {service.workingDays.map(day => (
                                    <span key={day} className="text-[10px] px-2 py-1 rounded-md font-bold bg-slate-900 text-white">{day}</span>
                                ))}
                            </div>
                        </div>

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
                                currentUser={loggedInUser} 
                                userAddresses={loggedInUser?.addresses || []} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}