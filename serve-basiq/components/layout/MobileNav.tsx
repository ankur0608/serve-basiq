"use client";

import { useEffect, useState } from "react"; // ✅ Import hooks
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

  // ✅ State to track visibility
  const [isVisible, setIsVisible] = useState(true);

  // ✅ Intersection Observer Logic
  useEffect(() => {
    // 1. Find the footer element
    const footerElement = document.getElementById("main-footer");

    if (!footerElement) return;

    // 2. Create the observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If footer is intersecting (visible), hide nav.
        // If footer is NOT intersecting (scrolled up), show nav.
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null, // viewport
        threshold: 0, // Trigger as soon as even 1 pixel of footer is visible
        rootMargin: "0px" // Exact viewport edge
      }
    );

    // 3. Start observing
    observer.observe(footerElement);

    // 4. Cleanup on unmount
    return () => {
      if (footerElement) observer.unobserve(footerElement);
    };
  }, [pathname]); // Re-run if path changes

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
        "transition-transform duration-300 ease-in-out", // Smooth animation
        // ✅ Apply the transform based on visibility
        !isVisible ? "translate-y-[110%]" : "translate-y-0"
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
                <div className="absolute -top-3 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-bounce">
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