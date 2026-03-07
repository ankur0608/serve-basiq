import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; // ✅ Fixed import path!

export default async function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Fetch the secure session from the server
    const session = await getServerSession(authOptions);

    // 2. The Check: If no session, OR user is NOT a worker
    if (!session || session.user?.isWorker !== true) {
        // Instantly kick them back to the home page
        redirect("/");
    }

    // 3. If they are a worker, load the dashboard page normally
    return <>{children}</>;
}