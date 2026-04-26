// components/listing/ListingContactBar.tsx
"use client";

import { FaPhone, FaWhatsapp, FaLock } from 'react-icons/fa6';
import { Zap } from 'lucide-react';
import { FaShieldHalved } from 'react-icons/fa6';
import type { ListingType } from '../ListingDetailView';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContactButtonBaseProps {
    isLoggedIn: boolean;
    requireLogin: boolean;
    href: string;
    label: string;
    icon: React.ReactNode;
    className: string;
    onGuestClick: () => void;
}

interface ContactButtonProps extends ContactButtonBaseProps {
    size?: 'default' | 'large';
}

// ─── ContactButton (desktop) ──────────────────────────────────────────────────
export function ContactButton({
    isLoggedIn, requireLogin, href, label, icon,
    className, size = 'default', onGuestClick,
}: ContactButtonProps) {
    const locked = requireLogin && !isLoggedIn;

    const handleClick = (e: React.MouseEvent) => {
        if (locked) { e.preventDefault(); onGuestClick(); }
    };

    return (
        /* FIX: Added missing <a tag */
        <a
            href={locked ? '#' : href}
            target={!locked && href.startsWith('https') ? '_blank' : undefined}
            rel={!locked && href.startsWith('https') ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            title={locked ? `Login to ${label}` : label}
            className={`
                relative flex items-center justify-center gap-2.5
                rounded-xl transition-all font-bold
                ${size === 'large' ? 'py-3.5 px-4 text-sm' : 'py-3 text-xs sm:text-sm'}
                ${className}
                ${locked ? 'opacity-60 cursor-pointer grayscale-[30%]' : 'cursor-pointer'}
            `}
        >
            {locked && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white rounded-full w-4 h-4 flex items-center justify-center z-10 shadow">
                    <FaLock size={8} />
                </span>
            )}
            <span className={size === 'large' ? 'text-xl' : 'text-base'}>{icon}</span>
            {label}
        </a>
    );
}

// ─── MobileContactButton ──────────────────────────────────────────────────────
export function MobileContactButton({
    isLoggedIn, requireLogin, href, icon,
    className, label, onGuestClick,
}: ContactButtonBaseProps) {
    const locked = requireLogin && !isLoggedIn;

    const handleClick = (e: React.MouseEvent) => {
        if (locked) { e.preventDefault(); onGuestClick(); }
    };

    return (
        /* FIX: Added missing <a tag */
        <a
            href={locked ? '#' : href}
            target={!locked && href.startsWith('https') ? '_blank' : undefined}
            rel={!locked && href.startsWith('https') ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            title={locked ? `Login to ${label}` : label}
            className={`
                relative w-[52px] h-[52px] shrink-0
                flex items-center justify-center rounded-[14px]
                active:scale-95 transition-all
                ${className}
                ${locked ? 'opacity-60 grayscale-[20%]' : ''}
            `}
        >
            {locked && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white rounded-full w-4 h-4 flex items-center justify-center shadow z-10">
                    <FaLock size={8} />
                </span>
            )}
            {icon}
        </a>
    );
}

// ─── DirectContactBlock (desktop card) ───────────────────────────────────────
interface DirectContactBlockProps {
    isLoggedIn: boolean;
    requireLogin: boolean;
    userPhone: string;
    onGuestClick: () => void;
}

export function DirectContactBlock({
    isLoggedIn, requireLogin, userPhone, onGuestClick,
}: DirectContactBlockProps) {
    return (
        <div className="hidden md:block bg-slate-50/70 rounded-2xl p-5 border border-slate-100">
            <h4 className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Zap size={14} className="fill-blue-500" /> Direct Contact
            </h4>
            {requireLogin && !isLoggedIn && (
                <p className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                    <FaLock size={10} className="text-slate-400" />
                    Login required to contact the owner
                </p>
            )}
            <div className="grid grid-cols-2 gap-3">
                <ContactButton
                    isLoggedIn={isLoggedIn}
                    requireLogin={requireLogin}
                    href={`tel:${userPhone}`}
                    label="Call"
                    size="large"
                    icon={<FaPhone size={18} />}
                    className="bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md text-slate-700 shadow-sm"
                    onGuestClick={onGuestClick}
                />
                <ContactButton
                    isLoggedIn={isLoggedIn}
                    requireLogin={requireLogin}
                    href={`https://wa.me/${userPhone}`}
                    label="WhatsApp"
                    size="large"
                    icon={<FaWhatsapp size={20} />}
                    className="bg-white border-2 border-slate-200 hover:border-green-400 hover:shadow-md text-slate-700 shadow-sm"
                    onGuestClick={onGuestClick}
                />
            </div>
        </div>
    );
}

// ─── SafeBookingBlock ─────────────────────────────────────────────────────────
interface SafeBookingBlockProps {
    listingType: ListingType;
}

export function SafeBookingBlock({ listingType }: SafeBookingBlockProps) {
    const safeLabel = listingType === 'RENTAL' ? 'Safe Rental' : 'Safe Booking';
    const safeItems = listingType === 'RENTAL'
        ? ['Verified Item Condition', 'Secure Escrow Payments', '24/7 Platform Support']
        : ['Verified Professional', 'No hidden charges', 'Secure Platform'];

    return (
        <div className="p-5 bg-[#F0FDF4] rounded-2xl border border-emerald-100">
            <h4 className="text-emerald-900 font-bold text-sm mb-3 flex items-center gap-2">
                <FaShieldHalved className="text-emerald-600" /> {safeLabel}
            </h4>
            <ul className="text-xs text-emerald-700 space-y-2.5 font-medium ml-1">
                {safeItems.map(item => (
                    <li key={item} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── MobileBottomBar ──────────────────────────────────────────────────────────
interface MobileBottomBarProps {
    isLoggedIn: boolean;
    requireLogin: boolean;
    userPhone: string;
    price: number;
    priceUnit: string;
    isQuote: boolean;
    onGuestClick: () => void;
}

export function MobileBottomBar({
    isLoggedIn, requireLogin, userPhone,
    price, priceUnit, isQuote, onGuestClick,
}: MobileBottomBarProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[60] px-4 py-3 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.08)] flex flex-col gap-2.5">
            {/* Price row */}
            <div className="flex items-baseline gap-1 px-1">
                <span className="text-slate-400 text-[13px] font-medium">
                    {isQuote ? '' : 'Starting at'}
                </span>
                {isQuote ? (
                    <span className="text-xl font-bold text-slate-900 tracking-tight ml-1">
                        Custom Quote
                    </span>
                ) : (
                    <>
                        <span className="text-[22px] font-bold text-slate-900 tracking-tight ml-1">
                            ₹{Number(price || 0).toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-medium text-[13px]">/{priceUnit}</span>
                    </>
                )}
            </div>

            {/* Button row */}
            <div className="flex items-center gap-2.5">
                <MobileContactButton
                    isLoggedIn={isLoggedIn}
                    requireLogin={requireLogin}
                    href={`tel:${userPhone}`}
                    label="Call"
                    className="border-[2px] border-blue-600 text-blue-600 bg-white"
                    icon={<FaPhone size={20} />}
                    onGuestClick={onGuestClick}
                />
                <MobileContactButton
                    isLoggedIn={isLoggedIn}
                    requireLogin={requireLogin}
                    href={`https://wa.me/${userPhone}`}
                    label="WhatsApp"
                    className="bg-[#25D366] text-white"
                    icon={<FaWhatsapp size={24} />}
                    onGuestClick={onGuestClick}
                />
                
                {/* FIX: Added missing <a tag */}
                <a
                    href="#booking-section"
                    className="flex-1 h-[52px] flex items-center justify-center gap-2 bg-[#0B1221] text-white rounded-[14px] tracking-wide font-medium text-[15px] shadow-sm active:scale-95 transition-all"
                >
                    Proceed to Booking &rarr;
                </a>
            </div>
        </div>
    );
}