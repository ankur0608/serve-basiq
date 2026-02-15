export function ProductsSkeleton() {
    return (
        <section className="min-h-screen bg-slate-50 pb-20 pt-4 md:pt-6">
            <div className="container mx-auto max-w-7xl px-4">

                {/* 1. Categories Skeleton: UPDATED to match Rectangular Cards */}
                <div className="mb-8">
                    {/* Header Line (Optional, matches 'Wholesale Products' title space) */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                        <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                    </div>

                    {/* The Scrollable Card List */}
                    <div className="flex gap-4 overflow-hidden pb-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                // specific width (w-40 md:w-56) makes them wide rectangles like your real cards
                                className="flex h-32 w-40 md:w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                            >
                                {/* Icon Placeholder (Blue icon in real app) */}
                                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

                                {/* Text Label Placeholder */}
                                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:gap-8 md:flex-row">

                    {/* 2. Sidebar Skeleton */}
                    <div className="hidden w-[260px] shrink-0 space-y-8 md:block">
                        <div className="space-y-4">
                            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-slate-200" />
                                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Main Content Skeleton */}
                    <div className="flex-1">
                        <div className="mb-6 h-14 w-full animate-pulse rounded-2xl bg-slate-200" />

                        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                                    <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-slate-200" />
                                    <div className="space-y-2 px-1">
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                                        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between px-1">
                                        <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
                                        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
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