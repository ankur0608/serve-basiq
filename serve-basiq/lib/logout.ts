import { useUIStore } from "@/lib/store";
import { signOut } from "next-auth/react";

export async function fullLogout() {
    // ✅ IMMEDIATELY kill Zustand memory
    useUIStore.setState({ currentUser: null });

    try {
        // ✅ remove persisted data
        localStorage.removeItem("servemate-storage");
        localStorage.removeItem("nextauth.message");

        // ✅ backend cookies
        await fetch("/api/auth/logout", { method: "POST" });

        // ✅ nextauth
        await signOut({ redirect: false });
    } finally {
        // ✅ absolute wipe
        localStorage.clear();
        sessionStorage.clear();

        // ✅ kill React tree
        window.location.replace("/");
    }
}
