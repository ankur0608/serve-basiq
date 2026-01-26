"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthListener() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Only run if user is logged in
        if (status === "authenticated" && session?.user) {

            // ✅ Check if we have a saved intent from before they left
            const intent = localStorage.getItem("loginIntent");

            if (intent === "provider") {
                // We found a saved intent! Now run the logic.
                const user = session.user as any;

                // ============================================================
                // 🚀 SAME LOGIC AS MOBILE FLOW
                // ============================================================

                // Check if they are an Existing Provider (SERVICE / PRODUCT / BOTH)
                if (user.providerType) {
                    // Existing Provider -> Dashboard
                    router.push("/provider/dashboard");
                } else {
                    // New User -> Become Pro Page
                    router.push("/become-pro");
                }

                // ✅ Clear the memory so this doesn't run again
                localStorage.removeItem("loginIntent");
            }

            // If intent was "user", we do nothing (they stay on the home page)
            // but we should still clear the storage
            if (intent === "user") {
                localStorage.removeItem("loginIntent");
            }
        }
    }, [session, status, router]);

    // This component renders nothing, it is invisible
    return null;
}