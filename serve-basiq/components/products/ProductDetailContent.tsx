// components/products/ProductDetailContent.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaShieldHalved, FaBoxOpen, FaTruckFast,
    FaCircleCheck, FaStore, FaCube, FaTags,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe, FaLock
} from 'react-icons/fa6';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductWrapper from '@/components/products/ProductWrapper';
import AppImage from '@/components/ui/AppImage';
import SupplierProfileModal from '@/components/products/SupplierProfileModal';
import RatingForm from '@/components/Rating/RatingForm';
import ProductSlider from '@/components/products/ProductSlider';
import InteractiveGallery from './InteractiveGallery';
import AppVideo from '../ui/AppVideo';

const isVideo = (url: string | null | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

interface Props { id: string; }

export default async function ProductDetailContent({ id }: Props) {
    const session = await getServerSession(authOptions);

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { name: true } },
            subcategory: { select: { name: true } },
            _count: { select: { reviews: true } },
            reviews: { include: { author: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
            user: { select: { id: true, name: true, shopName: true, email: true, phone: true, isVerified: true, image: true, profileImage: true, createdAt: true, instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true, addresses: { where: { type: "Work" }, take: 1, select: { city: true, state: true, country: true } } } }
        }
    });

    if (!product) return notFound();

    const relatedProducts = await prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: id } },
        take: 8,
        select: {
            id: true, name: true, price: true, unit: true,
            productImage: true,
            productImages: true,
            gallery: true,
            category: { select: { name: true } }
        }
    });

    const formattedRelatedProducts = relatedProducts.map(p => ({
        ...p,
        productImage: p.productImage || (p.productImages?.length > 0 ? p.productImages[0] : (p.gallery?.[0] || ""))
    }));

    let canReview = false;
    if (session?.user?.id) {
        const userId = session.user.id;
        if (product.userId !== userId) {
            const hasDeliveredOrder = await prisma.order.findFirst({ where: { userId: userId, productId: id, status: 'DELIVERED' } });
            const existingReview = await prisma.review.findFirst({ where: { authorId: userId, productId: id } });
            if (hasDeliveredOrder && !existingReview) canReview = true;
        }
    }

    let loggedInUser = null;
    if (session?.user?.id) {
        loggedInUser = await prisma.user.findUnique({ where: { id: session.user.id }, include: { addresses: true } });
    }

    // ✅ Map Images perfectly. Set ensures no duplicates, and productImage is forced to index 0
    const allImages = Array.from(new Set([
        product.productImage,
        ...(product.productImages || []),
        ...(product.gallery || [])
    ])).filter(Boolean) as string[];

    if (allImages.length === 0) {
        allImages.push("https://images.unsplash.com/photo-1586769852044-692d6e3703f0");
    }

    const provider = product.user;
    const displayName = provider?.shopName || provider?.name || "Verified Supplier";
    const providerImage = provider?.profileImage || provider?.image;
    const isVerified = provider?.isVerified || false;
    const location = provider?.addresses[0]?.city || "India";
    const isInStock = product.stockStatus === 'IN_STOCK';
    const ratingValue = product.reviews.length > 0 ? product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / product.reviews.length : 0;
    const reviewCount = product._count?.reviews || 0;

    const socials = [
        { icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white" },
        { icon: <FaFacebook size={20} />, url: provider?.facebookUrl, styleClass: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white" },
        { icon: <FaYoutube size={20} />, url: provider?.youtubeUrl, styleClass: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white" },
        { icon: <FaGlobe size={20} />, url: provider?.websiteUrl, styleClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white" },
    ].filter(s => s.url);

    return (
        <div className="pb-40 bg-slate-50 min-h-screen pt-4 md:pt-8 scroll-smooth">
            <div className="max-w-7xl mx-auto px-4">

                {/* 1. BACK BUTTON */}
                <div className="mb-6">
                    <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <FaArrowLeft /> Back to products
                    </Link>
                </div>

                {/* 2. MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ================= LEFT COLUMN ================= */}
                    <div className="lg:col-span-2 space-y-8 order-1">

                        {/* 👉 TITLE & REVIEWS ROW */}
                        <div>
                            {/* Top Badges (Stock & Condition) */}
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <span className={`flex items-center gap-1 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border ${isInStock ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                    <span className={`w-2 h-2 rounded-full ${isInStock ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></span>
                                    {isInStock ? `In Stock` : "Out of Stock"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200 uppercase tracking-widest">
                                    <FaTags className="text-slate-400" /> {product.condition || 'NEW'}
                                </span>
                            </div>

                            {/* Title and Rating sitting right next to each other */}
                            <div className="flex flex-wrap items-center justify-start gap-4">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                                    {product.name}
                                </h1>

                                {/* Rating Box (Inline) */}
                                <div className="flex items-center gap-2 bg-white px-3 py-2 md:px-4 md:py-2 rounded-2xl border border-slate-200 shadow-sm shrink-0 w-fit">
                                    <FaStar className="text-amber-500 text-lg md:text-xl" />
                                    <span className="font-black text-slate-900 text-lg md:text-xl leading-none">{ratingValue.toFixed(1)}</span>
                                    <span className="text-slate-300 mx-1">|</span>
                                    <a href="#reviews" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                        ({reviewCount} Reviews)
                                    </a>
                                </div>
                            </div>

                            {/* Location underneath the title */}
                            <div className="flex items-start gap-2 mt-4 text-sm md:text-base font-medium text-slate-600">
                                <FaLocationDot className="text-red-400 text-lg shrink-0 mt-0.5" />
                                <span>{location}</span>
                            </div>
                        </div>

                        {/* Interactive Gallery */}
                        <InteractiveGallery
                            mainProductImage={allImages[0]}
                            productImages={allImages.slice(1)}
                            productName={product.name}
                        />

                        {/* Product Details & Stats Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Min Order</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaBoxOpen className="text-slate-300" /> {product.moq} {product.unit}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Delivery</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaTruckFast className="text-slate-300" /> {product.deliveryType || "Standard"}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Unit Type</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2"><FaCube className="text-slate-300" /> {product.unit}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Condition</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-2 uppercase"><FaTags className="text-slate-300" /> {product.condition || 'NEW'}</p>
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
                        <div id="reviews" className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 scroll-mt-24">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8">Customer Reviews</h3>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
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
                                                            {[...Array(5)].map((_, i) => (<FaStar key={i} className={i < review.rating ? "fill-current" : "text-slate-200"} />))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
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
                                    {!session ? null : canReview ? (
                                        <div className="mb-8 border border-blue-100 bg-blue-50/50 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                            <RatingForm productId={product.id} />
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center top-24">
                                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                <FaBoxOpen />
                                            </div>
                                            <p className="text-slate-800 text-sm font-bold">Verified Purchase Only</p>
                                            <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                                                You can only leave a review after you have purchased this Product and it is marked as <strong>Delivered</strong>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN (Price & Booking) ================= */}
                    <div className="space-y-6 order-2 h-fit lg:top-24 z-20">

                        {/* Pricing & Booking Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mt-2">

                            {/* 👉 Category Badge Moved Here! */}
                            <div className="mb-4">
                                <span className="inline-block text-blue-600 text-[10px] md:text-xs font-bold uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {product.category?.name || "Product"}
                                    {product.subcategory?.name && ` • ${product.subcategory.name}`}
                                </span>
                            </div>

                            {/* Centralized Price Display */}
                            <div className="mb-6 pb-6 border-b border-slate-100">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Starting at</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-5xl font-black text-slate-900">₹{Number(product.price).toLocaleString()}</span>
                                    <span className="text-slate-400 font-bold text-lg">/ {product.unit}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 font-medium">+ GST if applicable</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-emerald-900 font-bold text-sm mb-2 flex items-center gap-2"><FaShieldHalved /> Safe Booking</h4>
                                    <ul className="text-xs text-emerald-700 space-y-1">
                                        <li>• Verified Professional</li>
                                        <li>• No hidden charges</li>
                                        <li>• Secure Platform</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Product Wrapper contains your Request Quote Modal */}
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

                        {/* Supplier Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <FaStore className="text-slate-400" /> Supplier Profile
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
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

                {formattedRelatedProducts.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-200">
                        <ProductSlider title="Related Products" products={formattedRelatedProducts} />
                    </div>
                )}
            </div>
        </div>
    );
}