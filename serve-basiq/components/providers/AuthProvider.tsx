'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

// Helper component to handle the sync logic inside the Provider
function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { setCurrentUser } = useUIStore();

    useEffect(() => {
        // Sync whenever the session exists (authenticated)
        if (status === 'authenticated' && session?.user) {

            // ✅ UPDATED: Explicitly map the new fields from NextAuth to your Store
            setCurrentUser({
                id: session.user.id,
                name: session.user.name || '',
                email: session.user.email || '',

                // ✅ FIX: Map 'image' (NextAuth) to 'img' (Your Store)
                img: session.user.image || '',

                // Now these pull correctly from the database via the session
                phone: session.user.phone || '',
                isPhoneVerified: session.user.isPhoneVerified || false,
                isWorker: session.user.isWorker || false,
                role: session.user.role || 'USER',
                providerType: session.user.providerType ?? undefined,

                // Initialize required fields that might be missing from session
                isVerified: false,
                isWebsite: true
            });
        }
    }, [session, status, setCurrentUser]);

    return <>{children}</>;
}

export default function AuthProvider({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <AuthSync>
                {children}
            </AuthSync>
        </SessionProvider>
    );
}