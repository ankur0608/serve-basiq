import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import ModalProvider from "@/components/providers/ModalProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import AuthListener from "@/components/auth/AuthListener";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "Servebasiq | Global Marketplace",
  description: "Connect with verified professionals and wholesale suppliers.",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans bg-slate-50 text-slate-800 flex flex-col min-h-screen md:pb-0`}>
        <AuthProvider>
          <QueryProvider>
            <ClientLayout>
              <AuthListener />
              {children}
            </ClientLayout>

            <ModalProvider />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}