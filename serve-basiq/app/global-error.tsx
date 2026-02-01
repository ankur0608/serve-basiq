'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h2>Critical System Error</h2>
                        <button onClick={() => reset()}>Try again</button>
                    </div>
                </div>
            </body>
        </html>
    );
}