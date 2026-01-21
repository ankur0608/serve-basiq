import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import ModalProvider from "@/components/providers/ModalProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "ServeMate | Global Marketplace",
  description: "Connect with verified professionals and wholesale suppliers.",

  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans bg-slate-50 text-slate-800 flex flex-col min-h-screen pb-[80px] md:pb-0`}>
        <AuthProvider>
          <QueryProvider>
            <ClientLayout>
              {children}
            </ClientLayout>

            <ModalProvider />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}