import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Metadata } from 'next';
import SearchContent from "@/components/search/SearchContent";

export const metadata: Metadata = {
    title: 'Search Services, Products & Rentals Near You | ServeBasiq',
    description: 'Search for any local service, product, or rental near you on ServeBasiq. Find plumbers, electricians, electronics, furniture, tools, and more from trusted local providers.',
    keywords: [
        'search local services', 'find services near me', 'search products nearby',
        'ServeBasiq search', 'local marketplace search India', 'find rentals near me'
    ],
    openGraph: {
        title: 'Search | ServeBasiq Local Discovery',
        description: 'Search for local services, products, and rentals near you on ServeBasiq.',
        url: 'https://www.servebasiq.com/search',
        siteName: 'ServeBasiq',
        type: 'website',
    },
    alternates: {
        canonical: 'https://www.servebasiq.com/search',
    },
};

export default function GlobalSearchPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Preparing search...</p>
                </div>
            }>
                <SearchContent />
            </Suspense>
        </div>
    );
}