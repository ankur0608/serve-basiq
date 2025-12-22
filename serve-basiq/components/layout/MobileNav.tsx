'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHouse, FaClipboardList, FaBoxOpen, FaWallet, FaUser
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/auth')) return null;

  const links = [
    { href: '/', label: 'Home', icon: FaHouse },
    { href: '/bookings', label: 'Bookings', icon: FaClipboardList },
    { href: '/orders', label: 'Orders', icon: FaBoxOpen },
    { href: '/wallet', label: 'Wallet', icon: FaWallet },
    { href: '/profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 active:scale-95 transition"
            >
              <div className={clsx(
                "text-xl transition-colors",
                isActive ? "text-primary" : "text-gray-400"
              )}>
                <link.icon />
              </div>
              <span className={clsx(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-gray-400"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
