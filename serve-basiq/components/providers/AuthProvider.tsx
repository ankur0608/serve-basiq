'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

// Helper component to handle the sync logic inside the Provider
function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { currentUser, setCurrentUser } = useUIStore();

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // ✅ Merging session data with existing store data
            // This prevents overwriting 'district' or 'addressLine2'
            setCurrentUser({
                ...currentUser,
                id: session.user.id,
                name: session.user.name || currentUser?.name || '',
                email: session.user.email || currentUser?.email || '',
                img: session.user.image || currentUser?.img || '',
                image: session.user.image || currentUser?.image || '',
                phone: session.user.phone || currentUser?.phone || '',
                isPhoneVerified: session.user.isPhoneVerified ?? currentUser?.isPhoneVerified ?? false,
                isWorker: session.user.isWorker ?? currentUser?.isWorker ?? false,
                role: session.user.role || currentUser?.role || 'USER',
                providerType: session.user.providerType ?? currentUser?.providerType,
                isWebsite: currentUser?.isWebsite ?? true,
                isVerified: currentUser?.isVerified ?? false,
            } as any);
        }
    }, [status, session, setCurrentUser]);

    return <>{children}</>;
}

export default function AuthProvider({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider
            // ✅ STOP FLICKERING: Prevents session refresh when switching tabs
            refetchOnWindowFocus={false}
        >
            <AuthSync>
                {children}
            </AuthSync>
        </SessionProvider>
    );
}