'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHouse, FaHelmetSafety, FaShop, FaHeart, FaUser } from 'react-icons/fa6';
import clsx from 'clsx'; // Make sure to npm install clsx

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: FaHouse },
    { name: 'Services', href: '/services', icon: FaHelmetSafety },
    { name: 'Shop', href: '/b2b', icon: FaShop, isB2B: true },
    { name: 'Saved', href: '/profile/saved', icon: FaHeart },
    { name: 'Account', href: '/profile', icon: FaUser },
  ];

  // Hide nav on specific detail pages if needed, otherwise show everywhere
  // const shouldHide = pathname.includes('/detail'); 
  // if (shouldHide) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] pb-safe h-[70px]">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center space-y-1 transition relative",
                isActive ? (item.isB2B ? "text-commerce-600" : "text-brand-600") : "text-gray-400 hover:text-gray-600"
              )}
            >
              {item.isB2B && (
                <div className="absolute -top-3 bg-commerce-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-bounce">
                  B2B
                </div>
              )}
              <Icon className="text-lg" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}