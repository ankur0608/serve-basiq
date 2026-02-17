export function ProductsSkeleton() {
    return (
        <section className="min-h-screen bg-slate-50 pb-20 pt-4 md:pt-6">
            <div className="container mx-auto max-w-7xl px-4">

                {/* 1. Categories Skeleton (Horizontal Scroll) */}
                <div className="mb-6 md:mb-8">
                    {/* Title Placeholder */}
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-4" />

                    {/* Scrollable Chips/Cards */}
                    <div className="flex gap-3 overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-10 w-24 md:w-32 shrink-0 rounded-full bg-slate-200 animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                {/* 2. Mobile Filter Bar Skeleton (Visible only on Mobile) */}
                <div className="mb-6 block md:hidden">
                    <div className="flex gap-3">
                        <div className="h-12 flex-1 rounded-2xl bg-slate-200 animate-pulse" />
                        <div className="h-12 w-12 rounded-2xl bg-slate-200 animate-pulse" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

                    {/* 3. Sidebar Skeleton (Hidden on Mobile, Matches w-[260px]) */}
                    <div className="hidden md:block w-[260px] shrink-0 space-y-8">
                        {/* Filter Group 1 */}
                        <div className="space-y-4">
                            <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
                                        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filter Group 2 */}
                        <div className="space-y-4">
                            <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                            <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
                            <div className="flex justify-between">
                                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Main Content Skeleton */}
                    <div className="flex-1">

                        {/* Search Bar Skeleton (Hidden on mobile as per your real component structure) */}
                        <div className="hidden md:block mb-6">
                            <div className="h-[56px] w-full rounded-2xl bg-slate-200 animate-pulse" />
                        </div>

                        {/* Product Grid Skeleton */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col rounded-3xl border border-slate-100 bg-white p-3 shadow-sm"
                                >
                                    {/* Image Placeholder - Aspect Ratio matches typical product cards */}
                                    <div className="aspect-square w-full rounded-2xl bg-slate-200 animate-pulse mb-3" />

                                    {/* Content Lines */}
                                    <div className="space-y-2 px-1 mb-4 flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                                            <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse" />
                                        </div>
                                        <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
                                    </div>

                                    {/* Bottom Row (Price & Avatar) */}
                                    <div className="mt-auto flex items-center justify-between px-1">
                                        <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}