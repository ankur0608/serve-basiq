"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHouse,
  FaClipboardList,
  FaBoxOpen,
  FaWallet,
  FaUser,
} from "react-icons/fa6";
import { IconType } from "react-icons"; // 1. Import IconType
import clsx from "clsx";
import { useUIStore } from "@/lib/store";

// 2. Define the shape of your link object
interface NavLink {
  href: string;
  label: string;
  icon: IconType;
  badge?: string; // '?' makes this optional
}

export default function MobileNav() {
  const pathname = usePathname();
  const currentUser = useUIStore((state) => state.currentUser);
  const onOpenLogin = useUIStore((state) => state.onOpenLogin);

  if (pathname.startsWith("/auth")) return null;

  // 3. Explicitly type the array as NavLink[]
  const links: NavLink[] = [
    { href: "/", label: "Home", icon: FaHouse },
    { href: "/bookings", label: "Bookings", icon: FaClipboardList },
    {
      href: "/orders",
      label: "Orders",
      icon: FaBoxOpen,
      badge: "B2B" // Added example badge to match your HTML logic
    },
    { href: "/wallet", label: "Wallet", icon: FaWallet },
    { href: "/profile", label: "Profile", icon: FaUser },
  ];

  return (
    // Note: Kept z-[60] and h-[70px] to ensure exact pixel matching with your HTML design
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe h-[70px] transition-transform duration-300">
      <div className="grid grid-cols-5 h-full">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.label === "Profile" && !currentUser) {
                  e.preventDefault();
                  onOpenLogin();
                }
              }}
              className="flex flex-col items-center justify-center space-y-1 relative transition group hover:text-blue-600"
            >
              {/* TypeScript will now allow this because badge is optional in NavLink */}
              {link.badge && (
                <div className="absolute -top-3 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-bounce">
                  {link.badge}
                </div>
              )}

              <div
                className={clsx(
                  "text-lg transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                )}
              >
                <link.icon />
              </div>

              <span
                className={clsx(
                  "text-[10px] font-bold transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}