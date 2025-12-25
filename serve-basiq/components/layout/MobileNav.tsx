"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHouse,
  FaBoxOpen,
  FaUser,
  FaScrewdriverWrench // Added for Services
} from "react-icons/fa6";
import { IconType } from "react-icons";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";

interface NavLink {
  href: string;
  label: string;
  icon: IconType;
  badge?: string;
}

export default function MobileNav() {
  const pathname = usePathname();
  const currentUser = useUIStore((state) => state.currentUser);
  const onOpenLogin = useUIStore((state) => state.onOpenLogin);

  if (pathname.startsWith("/auth")) return null;

  const links: NavLink[] = [
    {
      href: "/",
      label: "Home",
      icon: FaHouse
    },
    {
      href: "/services",
      label: "Services",
      icon: FaScrewdriverWrench
    },
    {
      href: "/products",
      label: "Products",
      icon: FaBoxOpen,
      badge: "Shop" // Optional badge for products
    },
    {
      href: "/profile",
      label: "Profile",
      icon: FaUser
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe h-[70px] transition-transform duration-300">
      {/* Updated to grid-cols-4 for 4 items */}
      <div className="grid grid-cols-4 h-full">
        {links.map((link) => {
          // Check if the current path matches the link or starts with it (for nested pages like /services/123)
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

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
              {link.badge && (
                <div className="absolute -top-3 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-bounce">
                  {link.badge}
                </div>
              )}

              <div
                className={clsx(
                  "text-xl transition-colors duration-200", // Increased icon size slightly
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