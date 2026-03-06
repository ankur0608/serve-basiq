import { useUIStore } from "@/lib/store";
import { signOut } from "next-auth/react";

export async function fullLogout() {
    useUIStore.setState({ currentUser: null });

    try {
        localStorage.removeItem("servemate-storage");
        localStorage.removeItem("nextauth.message");

        await fetch("/api/auth/logout", { method: "POST" });

        await signOut({ redirect: false });
    } finally {
        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("/");
    }
}
