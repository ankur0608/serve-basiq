import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.servebasiq.in/#organization",
      "name": "ServeBasiq",
      "url": "https://www.servebasiq.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.servebasiq.in/logo.png",
        "width": 1200,
        "height": 630
      },
      "description": "Discover and buy products, book services, and rent equipment from trusted local sellers on ServeBasiq. Electronics, fashion, furniture, beauty, auto accessories, building materials and more.",
      "foundingDate": "2023",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX", // Replace with actual number if available
        "contactType": "customer service"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.servebasiq.in/#website",
      "url": "https://www.servebasiq.in",
      "name": "ServeBasiq",
      "description": "Buy Local Products, Services & Rentals Near You",
      "publisher": {
        "@id": "https://www.servebasiq.in/#organization"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.servebasiq.in/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "en-IN"
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.servebasiq.in'),
  title: {
    template: '%s | ServeBasiq',
    default: 'ServeBasiq — Buy Local Products, Services & Rentals Near You',
  },
  description: 'Discover and buy products, book services, and rent equipment from trusted local sellers on ServeBasiq. Electronics, fashion, furniture, beauty, auto accessories, building materials and more.',
  keywords: [
    'buy products near me', 'local products India', 'electronics near me', 'furniture near me',
    'fashion products local', 'beauty products nearby', 'auto accessories local',
    'building materials near me', 'local B2B marketplace', 'ServeBasiq products',
    'buy from local sellers', 'nearby products India', 'local suppliers India',
    'local services India', 'rent equipment near me', 'local marketplace India',
    'buy local products online', 'services booking near me', 'equipment rental India',
    'trusted local sellers', 'B2B marketplace India', 'home services India',
    'repair services local', 'event services nearby', 'beauty services near me',
    'auto repair local', 'furniture rental', 'electronics rental',
    'building materials suppliers', 'fashion accessories local', 'health and beauty products India',
    'local rentals', 'service providers near me', 'product suppliers India',
    'rental equipment local', 'local business directory', 'buy sell trade local'
  ],
  applicationName: 'ServeBasiq',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'ServeBasiq',
    locale: 'en_IN',
    url: '/',
    title: 'ServeBasiq — Buy Local Products, Services & Rentals Near You',
    description: 'Shop electronics, furniture, fashion, beauty, auto & more from trusted local sellers near you.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ServeBasiq Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServeBasiq — Local Products, Services & Rentals',
    description: 'Shop electronics, furniture, fashion, beauty, auto & more from trusted local sellers near you.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  other: {
    'theme-color': '#1e293b', // slate-800
    'msapplication-TileColor': '#1e293b',
    'author': 'ServeBasiq Team',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
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