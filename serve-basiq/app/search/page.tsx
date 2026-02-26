import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import SearchContent from "@/components/search/SearchContent"
// 2. Wrap the exported page component in Suspense
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