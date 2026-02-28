import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import ModalProvider from "@/components/providers/ModalProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import AuthListener from "@/components/auth/AuthListener";
import { Toaster } from "react-hot-toast";

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

            {/* ✅ Custom Styled Toaster */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                className: 'text-sm font-bold',
                style: {
                  background: '#ffffff',       // bg-white
                  color: '#1e293b',            // text-slate-800
                  border: '1px solid #f1f5f9', // border-slate-100
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // shadow-md
                  borderRadius: '0.75rem',     // rounded-xl
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',        // emerald-500
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',        // red-500
                    secondary: '#ffffff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',        // blue-500
                    secondary: '#ffffff',
                  },
                },
              }}
            />

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