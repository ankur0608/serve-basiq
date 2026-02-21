// components/Rental/RentalDetailsContent.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaShieldHalved, FaPhone,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe,
    FaCircleCheck, FaBoxOpen, FaClock, FaLock
} from 'react-icons/fa6';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AppImage from '@/components/ui/AppImage';
import RatingForm from '@/components/Rating/RatingForm';
import RentalBookingWrapper from '@/components/Rental/RentalBookingWrapper';
import AppVideo from '../ui/AppVideo';
import ProductSlider from '@/components/products/ProductSlider'; // 👈 Import the Slider

// ✅ HELPER: Detect Video Files
const isVideo = (url: string | null | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

interface Props {
    id: string;
}

export default async function RentalDetailsContent({ id }: Props) {
    const session = await getServerSession(authOptions);

    // 1. DATABASE FETCH MAIN RENTAL
    const rental = await prisma.rental.findUnique({
        where: { id },
        include: {
            category: { select: { name: true } },
            subcategory: { select: { name: true } },
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
                    isVerified: true, image: true, profileImage: true,
                    instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true,
                }
            }
        }
    });

    if (!rental) return notFound();

    // 👉 NEW: Fetch Related Rentals (Same category, excluding current)
    const relatedRentalsRaw = await prisma.rental.findMany({
        where: {
            categoryId: rental.categoryId,
            id: { not: id } // Exclude the current rental
        },
        take: 8,
        select: {
            id: true,
            name: true,
            price: true,
            priceType: true,
            coverImg: true,
            rentalImg: true,
            gallery: true,
            category: { select: { name: true } }
        }
    });

    // Map the rental data to match the format the ProductSlider expects
    const relatedRentals = relatedRentalsRaw.map((r) => ({
        id: r.id,
        name: r.name,
        price: r.price || 0,
        unit: r.priceType?.toLowerCase() || 'day', // Uses priceType (e.g., 'daily', 'monthly') as the unit
        productImage: r.coverImg || r.rentalImg, // Maps rental image to slider image
        gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
        category: r.category
    }));

    // 2. LOGIC: CHECK REVIEW ELIGIBILITY
    let canReview = false;
    let reviewMessage = "Login to leave a review.";

    if (session?.user?.id) {
        const userId = session.user.id;

        if (rental.userId === userId) {
            canReview = false;
            reviewMessage = "You cannot review your own rental.";
        } else {
            const hasCompletedBooking = await prisma.rentalBooking.findFirst({
                where: {
                    userId: userId,
                    rentalId: id,
                    status: 'COMPLETED'
                }
            });

            const existingReview = await prisma.review.findFirst({
                where: {
                    authorId: userId,
                    rentalId: id
                }
            });

            if (!hasCompletedBooking) {
                canReview = false;
                reviewMessage = "You must complete a booking for this item to review it.";
            } else if (existingReview) {
                canReview = false;
                reviewMessage = "You have already reviewed this rental.";
            } else {
                canReview = true;
                reviewMessage = "";
            }
        }
    }

    // 3. DATA PREPARATION
    const mainImg = rental.coverImg || rental.rentalImg || "https://images.unsplash.com/photo-1503951458645-643d53633299?auto=format&fit=crop&q=80";
    const galleryImages = rental.gallery && rental.gallery.length > 0 ? rental.gallery : [mainImg];

    const provider = rental.user;
    const displayName = rental.name;
    const providerName = provider?.shopName || provider?.name || "Provider";
    const providerImage = provider?.profileImage || provider?.image;
    const isVerified = rental.isVerified || provider?.isVerified;

    // Address Logic
    const addressParts = [
        rental.addressLine1, rental.addressLine2,
        rental.city, rental.state
    ].filter(Boolean);

    let fullAddress = addressParts.join(', ');
    if (rental.pincode) fullAddress += ` - ${rental.pincode}`;
    if (!fullAddress && rental.city) fullAddress = rental.city || "";
    if (!fullAddress) fullAddress = "Location available upon booking";

    // Ratings
    const calculatedRating = rental.reviews.length > 0
        ? rental.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / rental.reviews.length
        : 0;
    const ratingValue = calculatedRating;
    const reviewCount = rental.reviews.length;

    // Socials
    const socials = [
        { icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
        { icon: <FaFacebook size={20} />, url: provider?.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
        { icon: <FaYoutube size={20} />, url: provider?.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
        { icon: <FaGlobe size={20} />, url: provider?.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
    ].filter(s => s.url && s.url !== "null");

    // Prices
    const safeDailyPrice = rental.dailyPrice ?? undefined;
    const safeMonthlyPrice = rental.monthlyPrice ?? undefined;
    const safeFixedPrice = rental.fixedPrice ?? undefined;

    return (
        <div className="pb-40 bg-slate-50 min-h-screen">
            {/* --- HERO BANNER --- */}
            <div className="h-[40vh] md:h-[50vh] w-full bg-slate-900 relative overflow-hidden">
                <AppImage
                    src={mainImg}
                    alt={displayName}
                    type="banner"
                    className="w-full h-full object-cover opacity-80"
                    priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-slate-900/60"></div>
                <Link href="/rentals" className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-20">
                    <FaArrowLeft />
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* MAIN INFO */}
                        {/* ... (Kept exactly the same) ... */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                            {rental.category?.name || "Rental"}
                                            {rental.subcategory?.name && ` • ${rental.subcategory.name}`}
                                        </span>
                                        {isVerified && (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                <FaCircleCheck /> Verified
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-4xl font-black text-slate-900 leading-tight">{displayName}</h1>

                                    <p className="flex items-start gap-2 text-slate-500 mt-2">
                                        <FaLocationDot className="text-red-400 mt-1 shrink-0" />
                                        <span className="leading-relaxed font-medium">{fullAddress}</span>
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

                            {/* Socials */}
                            {socials.length > 0 && (
                                <div className="mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm mb-3">Connect</h4>
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
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {rental.desc || "No description provided."}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Condition</p>
                                    <div className="flex items-center gap-1 font-bold text-slate-900 mt-1">
                                        <FaBoxOpen className="text-slate-400" /> {rental.itemCondition || "Good"}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Min Duration</p>
                                    <div className="flex items-center gap-1 font-bold text-slate-900 mt-1">
                                        <FaClock className="text-slate-400" /> {rental.minDuration || "1"} Days
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Security Dep.</p>
                                    <p className="font-bold text-slate-900 mt-1">₹{rental.securityDeposit || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Owner</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 relative">
                                            {providerImage && <AppImage src={providerImage} alt="Prov" type="avatar" className="w-full h-full object-cover" />}
                                        </div>
                                        <p className="font-bold text-slate-900 text-xs truncate max-w-[80px]">{providerName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GALLERY SECTION */}
                        {galleryImages.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {galleryImages.map((mediaUrl, i) => (
                                        <div key={i} className="h-48 w-full relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 bg-black">
                                            {isVideo(mediaUrl) ? (
                                                <AppVideo
                                                    src={mediaUrl}
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <AppImage
                                                    src={mediaUrl}
                                                    alt={`Gallery ${i}`}
                                                    type="gallery"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* REVIEWS */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Reviews & Ratings</h3>
                                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{reviewCount} reviews</span>
                            </div>

                            {/* RATING FORM */}
                            <div className="mb-8">
                                {canReview ? (
                                    <div className="mb-8 border border-blue-100 bg-blue-50/50 p-6 rounded-2xl">
                                        <h4 className="font-bold text-blue-900 mb-2">Rate your Experience</h4>
                                        <p className="text-sm text-blue-600 mb-4">You completed this rental! How was it?</p>
                                        <RatingForm rentalId={rental.id} />
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center sticky top-24">
                                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                {reviewMessage.includes("Login") ? <FaLock /> : <FaBoxOpen />}
                                            </div>
                                            <p className="text-slate-800 text-sm font-bold">Verified Purchase Only</p>
                                            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                                                You can only leave a review after you have booked this Rental and the job is marked as <strong>Completed</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* REVIEW LIST */}
                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {rental.reviews && rental.reviews.length > 0 ? (
                                    rental.reviews.map((review) => (
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
                                    <p className="text-slate-400 italic text-sm text-center py-8">No reviews yet.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* Availability */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4">Availability</h4>
                            <p className="text-slate-500 text-sm mb-2">Contact owner for schedule.</p>
                        </div>

                        {/* Booking Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-24 z-20">
                            <div className="mb-6">
                                <p className="text-slate-400 text-sm font-medium">{rental.priceType === 'FIXED' ? 'Fixed Price' : 'Starting from'}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">₹{rental.price}</span>
                                    <span className="text-slate-400 font-bold">/{rental.priceType?.toLowerCase() || 'day'}</span>
                                </div>
                            </div>

                            {/* Direct Contact */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <FaPhone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Direct Contact</p>
                                        <p className="text-sm font-bold text-slate-900">+91 {rental.user?.phone || 'Hidden'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2"><FaShieldHalved /> Safe Rental</h4>
                                    <ul className="text-xs text-emerald-700 space-y-1">
                                        <li>• Verified Item</li>
                                        <li>• Secure Platform</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Wrapper Component */}
                            <RentalBookingWrapper
                                rentalId={rental.id}
                                rentalName={displayName}
                                rentalImage={mainImg}
                                ownerLocation={fullAddress}
                                dailyPrice={safeDailyPrice}
                                monthlyPrice={safeMonthlyPrice}
                                fixedPrice={safeFixedPrice}
                                currentUser={session?.user || null}
                                userAddresses={[]}
                            />
                        </div>
                    </div>
                </div>

                {/* 👉 NEW: Reusing the ProductSlider mapped to Rentals */}
                <ProductSlider
                    title="Related Rentals"
                    products={relatedRentals}
                />

            </div>
        </div>
    );
}