export function ExplorerSkeleton() {
    return (
        <div className="animate-pulse container mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border h-72 flex flex-col overflow-hidden">
                        <div className="h-36 bg-slate-200"></div>
                        <div className="p-3 gap-2 flex flex-col flex-1">
                            <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                            <div className="mt-auto h-8 bg-slate-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}