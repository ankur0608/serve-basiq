"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHouse,
  FaBoxOpen,
  FaUser,
  FaScrewdriverWrench
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

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const footerElement = document.getElementById("main-footer");
    if (!footerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px"
      }
    );

    observer.observe(footerElement);

    return () => {
      if (footerElement) observer.unobserve(footerElement);
    };
  }, [pathname]);

  if (pathname.startsWith("/auth")) return null;

  const links: NavLink[] = [
    { href: "/", label: "Home", icon: FaHouse },
    { href: "/services", label: "Services", icon: FaScrewdriverWrench },
    { href: "/rentals", label: "Rentals", icon: FaScrewdriverWrench },
    { href: "/products", label: "Products", icon: FaBoxOpen, badge: "Shop" },
    { href: "/profile", label: "Profile", icon: FaUser },
  ];

  return (
    <nav
      className={clsx(
        "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60]",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe h-[70px]",
        // Animation classes
        "transition-all duration-500 ease-in-out",
        !isVisible
          ? "translate-y-[140%] opacity-0 pointer-events-none" // Hides deep enough to cover the badge & fades out background
          : "translate-y-0 opacity-100"
      )}
    >
      <div className="grid grid-cols-5 h-full">
        {links.map((link) => {
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
                <div
                  className={clsx(
                    "absolute -top-3 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-bounce",
                    // Double check to ensure badge fades out instantly if nav is hiding
                    !isVisible && "opacity-0"
                  )}
                >
                  {link.badge}
                </div>
              )}

              <div
                className={clsx(
                  "text-xl transition-colors duration-200",
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