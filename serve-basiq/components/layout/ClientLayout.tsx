'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Define routes where Header/Footer should be hidden
    const isDashboard = pathname?.startsWith('/provider/dashboard');

    return (
        <>
            {/* Only show Header if NOT on dashboard */}
            {!isDashboard && <Header />}

            <main className={`flex-grow w-full relative ${!isDashboard ? '' : 'h-screen overflow-hidden'}`}>
                {children}
            </main>

            {/* Only show Footer/MobileNav if NOT on dashboard */}
            {!isDashboard && <Footer />}
            {!isDashboard && <MobileNav />}
        </>
    );
}