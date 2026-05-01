// components/listing/ListingDetailView.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    FaArrowLeft, FaLocationDot, FaStar,
    FaPhone, FaWhatsapp,
    FaInstagram, FaFacebook, FaYoutube, FaGlobe,
    FaCircleCheck, FaLock, FaBoxOpen,
    FaTruckFast, FaCube, FaStore, FaRegClock,
    FaClock, FaShieldHalved,
    FaHeart, FaRegHeart, FaShareNodes, FaCheck,
    FaXTwitter, FaEnvelope, FaLink,
} from 'react-icons/fa6';
import { Zap } from 'lucide-react';
import { Session } from 'next-auth';
import AppImage from '@/components/ui/AppImage';
import { useListingPageData } from '@/app/hook/useListingPageData';

// ── Split components ──────────────────────────────────────────────────────────
// import SmartGalleryGrid from './listing/SmartGallery';
import {
    ContactButton,
    MobileContactButton,
    DirectContactBlock,
    SafeBookingBlock,
    MobileBottomBar,
} from './listing/ListingContactBar';

const ProductSlider       = dynamic(() => import('@/components/products/ProductSlider'),       { ssr: false });
const InteractiveGallery  = dynamic(() => import('@/components/products/InteractiveGallery'),  { ssr: false });
const SupplierProfileModal = dynamic(() => import('@/components/products/SupplierProfileModal'), { ssr: false });
const RatingForm          = dynamic(() => import('@/components/Rating/RatingForm'),            { ssr: false });
const LoginModal          = dynamic(() => import('@/components/auth/LoginModal'),              { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatEnum = (str?: string) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, ' ');
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type ListingType = 'SERVICE' | 'PRODUCT' | 'RENTAL';

export interface ListingDetailViewProps {
    listing: ListingData;
    relatedListings: RelatedListing[];
    session: Session | null;
    loggedInUser: any;
    listingType: ListingType;
    bookingSlot: React.ReactNode;
    requireLoginForContact?: boolean;
}

export interface ListingData {
    id: string;
    name: string;
    desc: string;
    price: number;
    priceType?: string;
    unit?: string;
    coverImg?: string | null;
    mainimg?: string | null;
    serviceimg?: string | null;
    rentalImg?: string | null;
    productImage?: string | null;
    serviceImages?: string[];
    rentalImages?: string[];
    productImages?: string[];
    gallery?: string[];
    rating?: number | null;
    reviews?: any[];
    isVerified?: boolean;
    addressLine1?: string | null;
    addressLine2?: string | null;
    landmark?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    loc?: string | null;
    is24x7?: boolean;
    openTime?: string;
    closeTime?: string;
    workingDays?: string[];
    itemCondition?: string;
    minDuration?: number | string;
    securityDeposit?: number;
    condition?: string;
    deliveryType?: string;
    moq?: number;
    stockStatus?: string;
    experience?: number;
    radiusKm?: number;
    isRemote?: boolean;
    category?: { name: string } | null;
    subcategory?: { name: string } | null;
    user: {
        id?: string;
        name?: string | null;
        shopName?: string | null;
        image?: string | null;
        profileImage?: string | null;
        phone?: string | null;
        isVerified?: boolean;
        instagramUrl?: string | null;
        facebookUrl?: string | null;
        youtubeUrl?: string | null;
        websiteUrl?: string | null;
        [key: string]: any;
    };
}

export interface RelatedListing {
    id: string;
    name: string;
    price: number;
    priceType?: string;
    unit?: string;
    productImage: string | null;
    gallery?: string[];
    category?: { name: string } | null;
    listingType: ListingType;
    ownerLocation?: string;
}

export interface DetailStat {
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingDetailView({
    listing,
    relatedListings,
    session,
    loggedInUser: initialUser,
    listingType,
    bookingSlot,
    requireLoginForContact = true,
}: ListingDetailViewProps) {

    const { currentUser, eligibility, isEligibilityLoading } = useListingPageData({
        itemId: listing.id,
        listingType,
        initialUser,
        session,
    });

    const isLoggedIn = !!session;
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const openLoginModal  = () => setLoginModalOpen(true);
    const closeLoginModal = () => {
        setLoginModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    // ── Like + Share state ────────────────────────────────────────────────────
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const shareWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/user/favorites');
                if (!res.ok) return;
                const data = await res.json();
                const key = listingType === 'PRODUCT' ? 'products' : listingType === 'RENTAL' ? 'rentals' : 'services';
                const ids: string[] = data?.[key] || [];
                if (!cancelled) setIsLiked(ids.includes(listing.id));
            } catch { /* ignore */ }
        })();
        return () => { cancelled = true; };
    }, [isLoggedIn, listing.id, listingType]);

    useEffect(() => {
        if (!shareOpen) return;
        const onClickAway = (e: MouseEvent) => {
            if (shareWrapRef.current && !shareWrapRef.current.contains(e.target as Node)) {
                setShareOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShareOpen(false); };
        document.addEventListener('mousedown', onClickAway);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClickAway);
            document.removeEventListener('keydown', onKey);
        };
    }, [shareOpen]);

    const handleLike = async () => {
        if (!isLoggedIn) { openLoginModal(); return; }
        if (isLikeLoading) return;
        setIsLikeLoading(true);
        const previous = isLiked;
        setIsLiked(!previous); // optimistic
        try {
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: listing.id, type: listingType }),
            });
            if (!res.ok) throw new Error('toggle failed');
            const data = await res.json();
            setIsLiked(data?.status === 'added');
        } catch {
            setIsLiked(previous); // revert on failure
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch { /* clipboard blocked — silently ignore */ }
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const isQuote      = listing.priceType?.toUpperCase() === 'QUOTE';
    const provider     = listing.user;
    const displayName  = provider?.shopName || provider?.name || listing.name;
    const isVerified   = listing.isVerified || provider?.isVerified;
    const userPhone    = provider?.phone || '';

    const addressParts = [
        listing.addressLine1,
        listing.addressLine2,
        listing.landmark ? `Near ${listing.landmark}` : null,
        listing.city,
        listing.state,
    ].filter(Boolean);
    let fullAddress = addressParts.join(', ');
    if (listing.pincode) fullAddress += ` - ${listing.pincode}`;
    if (!fullAddress && listing.loc) fullAddress = listing.loc;
    if (!fullAddress) fullAddress = listingType === 'RENTAL'
        ? 'Location available upon booking'
        : 'Location not specified';

    const calculatedRating: number | null =
        listing.rating != null
            ? listing.rating
            : listing.reviews && listing.reviews.length > 0
                ? listing.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / listing.reviews.length
                : null;

    // ── All images (deduped) ──────────────────────────────────────────────────
    const allImages = Array.from(new Set([
        listing.coverImg || listing.rentalImg || listing.serviceimg || listing.mainimg || listing.productImage,
        ...(listing.serviceImages || listing.rentalImages || listing.productImages || []),
        ...(listing.gallery || []),
    ])).filter(Boolean) as string[];

    if (allImages.length === 0) {
        allImages.push('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop');
    }

    const mainImg       = allImages[0];
    const galleryImages = (Array.isArray(listing.gallery) ? listing.gallery : []).filter(Boolean) as string[];

    // ── Share targets (built after mainImg + price label is known) ────────────
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const sharePriceLabel = isQuote
        ? 'Custom Quote'
        : `₹${Number(listing.price || 0).toLocaleString()}${
            listingType === 'PRODUCT'
                ? ` / ${(listing.unit?.toLowerCase() || 'piece')}`
                : listingType === 'RENTAL'
                    ? ` / ${formatEnum(listing.priceType)}`
                    : listing.priceType?.toUpperCase() === 'HOURLY' ? ' / hour' : ''
        }`;
    const shareCityLabel = [listing.city, listing.state].filter(Boolean).join(', ');
    const shareCategoryLabel = listing.category?.name || listingType;
    const shareTagline = [sharePriceLabel, shareCityLabel].filter(Boolean).join(' • ');
    const shareText = `Check out "${displayName}" on Serve-Basiq — ${shareTagline}`;
    const enc = encodeURIComponent;
    const shareTargets = [
        {
            name: 'WhatsApp',
            href: `https://wa.me/?text=${enc(`*${displayName}*\n${shareTagline}\n\n${shareUrl}`)}`,
            icon: <FaWhatsapp size={18} />,
            iconWrap: 'bg-green-50 text-green-500',
        },
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}`,
            icon: <FaFacebook size={18} />,
            iconWrap: 'bg-blue-50 text-blue-600',
        },
        {
            name: 'Twitter',
            href: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareText)}`,
            icon: <FaXTwitter size={18} />,
            iconWrap: 'bg-slate-100 text-slate-900',
        },
        {
            name: 'Email',
            href: `mailto:?subject=${enc(`${displayName} on Serve-Basiq`)}&body=${enc(
                `${displayName}\n${shareTagline}\n${shareCategoryLabel}\n\n${shareUrl}`
            )}`,
            icon: <FaEnvelope size={18} />,
            iconWrap: 'bg-amber-50 text-amber-600',
        },
    ];

    // ── Socials ───────────────────────────────────────────────────────────────
    const socials = [
        { name: 'Instagram', icon: <FaInstagram size={20} />, url: provider?.instagramUrl, styleClass: 'text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white' },
        { name: 'Facebook',  icon: <FaFacebook  size={20} />, url: provider?.facebookUrl,  styleClass: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white' },
        { name: 'YouTube',   icon: <FaYoutube   size={20} />, url: provider?.youtubeUrl,   styleClass: 'text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white' },
        { name: 'Website',   icon: <FaGlobe     size={20} />, url: provider?.websiteUrl,   styleClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white' },
    ].filter(s => s.url && s.url.trim() !== '' && s.url !== 'null');

    // ── Detail stats ──────────────────────────────────────────────────────────
    const detailStats: DetailStat[] = listingType === 'RENTAL' ? [
        { label: 'Condition',     icon: <FaBoxOpen  className="text-slate-300" />,             value: formatEnum(listing.itemCondition) },
        { label: 'Min. Duration', icon: <FaClock    className="text-slate-300 shrink-0" />,    value: isQuote ? 'Flexible' : String(listing.minDuration || '1 Day') },
        { label: 'Deposit',       icon: null,                                                  value: `₹${listing.securityDeposit || 0}` },
        { label: 'Owner',         icon: null,                                                  value: provider?.shopName || provider?.name },
    ] : listingType === 'PRODUCT' ? [
        { label: 'Condition',  icon: <FaCube      className="text-slate-300" />,               value: listing.condition || 'NEW' },
        { label: 'Delivery',   icon: <FaTruckFast className="text-slate-300 shrink-0" />,      value: listing.deliveryType || 'DELIVERY' },
        { label: 'Min. Order', icon: <FaBoxOpen   className="text-slate-300 shrink-0" />,      value: `${listing.moq || 1} ${listing.unit || 'PIECE'}` },
        { label: 'Stock',      icon: null,                                                     value: (listing.stockStatus || 'IN STOCK').replace(/_/g, ' ') },
    ] : [
        { label: 'Experience', icon: <FaBoxOpen   className="text-slate-300" />,               value: `${listing.experience || 0}+ Yrs` },
        { label: listing.isRemote ? 'Coverage' : 'Service Area', icon: listing.isRemote ? <FaGlobe className="text-slate-300 shrink-0" /> : <FaTruckFast className="text-slate-300 shrink-0" />, value: listing.isRemote ? 'Global / Online' : `${listing.radiusKm || 10} km` },
        { label: 'Billing',    icon: <FaCube      className="text-slate-300 shrink-0" />,      value: isQuote ? 'Custom Quote' : listing.priceType },
        { label: 'Status',     icon: null,                                                     value: listing.is24x7 ? '24×7 Open' : 'Standard' },
    ];

    // ── Price unit label ──────────────────────────────────────────────────────
    const priceUnit = listingType === 'PRODUCT'
        ? (listing.unit?.toLowerCase() || 'piece')
        : listingType === 'RENTAL'
            ? formatEnum(listing.priceType)
            : listing.priceType?.toUpperCase() === 'HOURLY' ? 'hour' : 'fixed';

    const backHref    = `/${listingType.toLowerCase()}s`;
    const backLabel   = listingType === 'PRODUCT' ? 'Products' : listingType === 'RENTAL' ? 'Rentals' : 'Services';
    const supplierLabel = listingType === 'RENTAL' ? 'Owner Details' : 'Supplier Profile';

    // ── Reusable blocks ───────────────────────────────────────────────────────
    const PricingAndBookingBlock = (
        <div id="booking-section" className="bg-white rounded-[32px] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 scroll-mt-24">
            {/* Price */}
            <div className="mb-4 pb-4">
                <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                    {isQuote ? 'Pricing' : 'Starting at'}
                </p>
                <div className="flex items-baseline gap-1">
                    {isQuote ? (
                        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Custom Quote
                        </span>
                    ) : (
                        <>
                            <span className="text-5xl font-black text-slate-900 tracking-tight">
                                ₹{Number(listing.price || 0).toLocaleString()}
                            </span>
                            <span className="text-slate-400 font-bold text-lg">/{priceUnit}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {/* Contact buttons */}
                <DirectContactBlock
                    isLoggedIn={isLoggedIn}
                    requireLogin={requireLoginForContact}
                    userPhone={userPhone}
                    onGuestClick={openLoginModal}
                />
                {/* Safe booking badge */}
                <SafeBookingBlock listingType={listingType} />
            </div>

            {bookingSlot}
        </div>
    );

    const SupplierProfileBlock = (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <FaStore className="text-slate-400" /> {supplierLabel}
            </h4>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                    <AppImage
                        src={provider?.profileImage || provider?.image || ''}
                        alt={displayName}
                        type="avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="overflow-hidden">
                    <h5 className="font-bold text-slate-900 leading-tight truncate">
                        {provider?.shopName || provider?.name || 'Unknown'}
                    </h5>
                    {isVerified && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                            <FaCircleCheck /> Verified {listingType === 'RENTAL' ? 'Owner' : ''}
                        </span>
                    )}
                </div>
            </div>
            <SupplierProfileModal supplier={provider?.id ? (provider as any) : null} />
        </div>
    );

    // ── Related listings ──────────────────────────────────────────────────────
    const sliderProducts = relatedListings.map(item => ({
        id:            item.id,
        name:          item.name,
        price:         item.price,
        priceType:     item.priceType,
        unit:          item.unit,
        productImage:  item.productImage ?? null,
        gallery:       item.gallery,
        category:      item.category,
        listingType:   item.listingType,
        ownerLocation: item.ownerLocation,
    }));

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="pb-36 md:pb-20 bg-slate-50 min-h-screen pt-4 md:pt-8 scroll-smooth">
            <div className="max-w-7xl mx-auto px-4">

                {/* Back */}
                <div className="mb-6">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition px-4 py-2 rounded-xl"
                    >
                        <FaArrowLeft /> Back to {backLabel}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left column ────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-8 order-1">

                        {/* Header */}
                        <div>
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <span className="text-blue-600 text-[10px] md:text-xs font-bold uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {listing.category?.name || listingType}
                                    {listing.subcategory?.name && ` • ${listing.subcategory.name}`}
                                </span>
                                {listingType === 'SERVICE' && listing.isRemote && (
                                    <span className="flex items-center gap-1 text-purple-600 text-[10px] md:text-xs font-bold uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                        <FaGlobe /> Online / Remote
                                    </span>
                                )}
                                {isVerified && (
                                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] md:text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                        <FaCircleCheck /> Verified
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                                        {displayName}
                                    </h1>
                                    {provider?.shopName && provider.shopName !== listing.name && (
                                        <h2 className="text-sm md:text-base font-semibold text-slate-500 tracking-wide">
                                            {listing.name}
                                        </h2>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0 mt-1 flex-wrap">
                                    {/* Like */}
                                    <button
                                        type="button"
                                        onClick={handleLike}
                                        disabled={isLikeLoading}
                                        aria-pressed={isLiked}
                                        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                                        className={`h-11 w-11 md:h-12 md:w-12 flex items-center justify-center rounded-2xl border shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                                            isLiked
                                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                                                : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                                        }`}
                                    >
                                        {isLiked
                                            ? <FaHeart className="text-lg md:text-xl" />
                                            : <FaRegHeart className="text-lg md:text-xl" />}
                                    </button>

                                    {/* Share */}
                                    <div className="relative" ref={shareWrapRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShareOpen(o => !o)}
                                            aria-label="Share this listing"
                                            aria-expanded={shareOpen}
                                            aria-haspopup="menu"
                                            className={`h-11 px-3 md:h-12 md:px-4 inline-flex items-center gap-2 rounded-2xl border shadow-sm transition-all duration-200 ${
                                                shareOpen
                                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                        >
                                            <FaShareNodes className="text-lg md:text-xl" />
                                            <span className="hidden sm:inline text-sm font-bold">Share</span>
                                        </button>

                                        {shareOpen && (
                                            <div
                                                role="menu"
                                                className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-100">
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Share this listing</p>
                                                </div>

                                                {/* Preview card — what recipients will see */}
                                                <div className="p-3 border-b border-slate-100 bg-slate-50">
                                                    <div className="flex gap-3 bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0 bg-slate-100">
                                                            <AppImage
                                                                src={mainImg}
                                                                alt={displayName}
                                                                type="thumbnail"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 truncate">
                                                                {shareCategoryLabel}
                                                            </p>
                                                            <p className="text-sm font-bold text-slate-900 truncate leading-tight mt-0.5">
                                                                {displayName}
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                                                                {shareTagline}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 truncate mt-1">
                                                                {shareUrl.replace(/^https?:\/\//, '')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <ul className="py-1">
                                                    {shareTargets.map(t => (
                                                        <li key={t.name}>
                                                            <a
                                                                href={t.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => setShareOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                                                role="menuitem"
                                                            >
                                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.iconWrap}`}>
                                                                    {t.icon}
                                                                </span>
                                                                <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                                                            </a>
                                                        </li>
                                                    ))}
                                                    <li>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyLink}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                                            role="menuitem"
                                                        >
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${shareCopied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                                                {shareCopied ? <FaCheck size={16} /> : <FaLink size={16} />}
                                                            </span>
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                {shareCopied ? 'Link copied!' : 'Copy Link'}
                                                            </span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0 w-fit">
                                        {calculatedRating !== null && (
                                            <>
                                                <FaStar className="text-amber-500 text-lg md:text-xl" />
                                                <span className="font-black text-slate-900 text-lg md:text-xl leading-none">
                                                    {calculatedRating.toFixed(1)}
                                                </span>
                                                <span className="text-slate-300 mx-1">|</span>
                                            </>
                                        )}

                                        <a
                                            href="#reviews"
                                            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                        >
                                            {calculatedRating !== null
                                                ? `(${listing.reviews?.length || 0} Reviews)`
                                                : 'No reviews yet'}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mt-4 text-sm md:text-base font-medium text-slate-600">
                                <FaLocationDot className="text-red-400 text-lg shrink-0 mt-0.5" />
                                <span>{fullAddress}</span>
                            </div>
                        </div>

                        {/* Hero gallery (interactive main image) */}
                        <InteractiveGallery
                            mainProductImage={mainImg}
                            productImages={allImages.slice(1)}
                            productName={displayName}
                        />

                        {/* Description + stats */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <div className="border-b border-slate-100 pb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    {listingType === 'RENTAL' ? 'Item Description' : 'Description'}
                                </h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {listing.desc}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {detailStats.map(stat => (
                                    <div key={stat.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{stat.label}</p>
                                        <p className="font-bold text-slate-900 flex items-center gap-2 truncate">
                                            {stat.icon}{stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Operating hours */}
                            {(listing.is24x7 || (listing.workingDays && listing.workingDays.length > 0)) && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <FaRegClock className="text-slate-400" />
                                        {listingType === 'SERVICE' ? 'Business Hours' : 'Operating Hours'}
                                    </h4>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${listing.is24x7 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Current Status</p>
                                                <p className={`font-black text-sm md:text-base ${listing.is24x7 ? 'text-green-600' : 'text-slate-900'}`}>
                                                    {listing.is24x7 ? 'OPEN 24/7' : `${listing.openTime} - ${listing.closeTime}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="h-px w-full md:w-px md:h-10 bg-slate-200" />
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Available Days</p>
                                            <div className="flex flex-wrap gap-2">
                                                {listing.is24x7 ? (
                                                    <span className="text-xs px-3 py-1.5 rounded-lg font-bold bg-green-100/50 text-green-700 border border-green-200 flex items-center gap-1.5 w-fit">
                                                        <FaCircleCheck size={12} /> Every Day (Monday - Sunday)
                                                    </span>
                                                ) : listing.workingDays && listing.workingDays.length > 0 ? (
                                                    listing.workingDays.map((day: string) => (
                                                        <span key={day} className="text-[10px] md:text-xs px-2.5 py-1.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                            {day}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] md:text-xs text-slate-400 italic font-medium">Days not specified</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Socials */}
                            {socials.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider">
                                        Connect with {listingType === 'RENTAL' ? 'Owner' : 'Provider'}
                                    </h4>
                                    <div className="flex gap-3">
                                        {socials.map((social, i) => (
                                            /* FIX: Added missing <a tag here */
                                            <a
                                                key={i}
                                                href={social.url!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-1 ${social.styleClass}`}
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Pricing + Owner (shown above gallery on mobile) */}
                        <div className="block lg:hidden space-y-6">
                            {PricingAndBookingBlock}
                            {SupplierProfileBlock}
                        </div>

                        {/* ── Smart gallery grid (replaces old grid) ──── */}
                        {/* <SmartGalleryGrid images={galleryImages} title="Gallery Media" /> */}

                        {/* Reviews */}
                        <div id="reviews" className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 scroll-mt-24">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8">
                                {listingType === 'RENTAL' ? 'User Reviews' : 'Customer Reviews'}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                    {listing.reviews && listing.reviews.length > 0 ? (
                                        listing.reviews.map((review: any) => (
                                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden relative">
                                                        <AppImage
                                                            src={review.author.image || ''}
                                                            alt="User"
                                                            type="avatar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {review.author.name || 'Customer'}
                                                        </p>
                                                        <div className="flex text-amber-500 text-[10px]">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
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
                                            <p className="text-slate-400 font-medium text-sm mt-2">No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {!session ? null : isEligibilityLoading ? (
                                        <p>Loading...</p>
                                    ) : eligibility?.canReview ? (
                                        <RatingForm
                                            {...(listingType === 'RENTAL' ? { rentalId: listing.id } : { serviceId: listing.id })}
                                            type={listingType}
                                        />
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                                            <FaCircleCheck className="mx-auto text-emerald-500 text-2xl mb-2" />
                                            <p className="text-slate-800 text-sm font-bold">
                                                {listingType === 'RENTAL' ? 'Verified Rental Only' : 'Verified Booking Only'}
                                            </p>
                                            <p className="text-slate-500 text-xs mt-2">
                                                {listingType === 'RENTAL'
                                                    ? 'Complete a rental period to leave a review.'
                                                    : `${listingType === 'PRODUCT' ? 'Purchase this product' : 'Book the service'} and mark as complete to leave a review.`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop sticky sidebar ──────────────────────── */}
                    <div className="hidden lg:block space-y-6 order-2 h-fit lg:sticky lg:top-24 z-20">
                        {PricingAndBookingBlock}
                        {SupplierProfileBlock}
                    </div>
                </div>

                {/* Related listings */}
                {sliderProducts.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-200">
                        <ProductSlider
                            title={`More ${backLabel} You Might Like`}
                            products={sliderProducts}
                            currentUser={currentUser}
                        />
                    </div>
                )}
            </div>

            {/* Mobile bottom bar */}
            <MobileBottomBar
                isLoggedIn={isLoggedIn}
                requireLogin={requireLoginForContact}
                userPhone={userPhone}
                price={listing.price}
                priceUnit={priceUnit}
                isQuote={isQuote}
                onGuestClick={openLoginModal}
            />

            {/* Login modal */}
            {loginModalOpen && (
                <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
            )}
        </div>
    );
}