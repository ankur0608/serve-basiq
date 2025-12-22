import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import ModalProvider from "@/components/providers/ModalProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "ServeMate | Global Marketplace",
  description: "Connect with verified professionals and wholesale suppliers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans bg-slate-50 text-slate-800 flex flex-col min-h-screen pb-[80px] md:pb-0`}>
        <Header />
        <main className="flex-grow w-full relative">
          {children}

        </main>
        <ModalProvider />

        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}