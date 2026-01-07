'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

// Helper component to handle the sync logic inside the Provider
function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { setCurrentUser, currentUser } = useUIStore();

    useEffect(() => {
        // If NextAuth has a user, but our global store doesn't, sync it.
        if (status === 'authenticated' && session?.user && !currentUser) {

            // We map the Google session data to your app's user structure
            setCurrentUser({
                id: session.user.id || session.user.email, // Use email as fallback ID if needed
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
                phone: '', // Google doesn't provide phone usually, leave empty
                isWorker: false, // Default to customer
                ...session.user // Spread any other custom fields
            });
        }
    }, [session, status, currentUser, setCurrentUser]);

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