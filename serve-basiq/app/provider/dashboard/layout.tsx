// app/provider/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// 🚀 FORCE DYNAMIC: This ensures getServerSession always reads the fresh cookie
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // If the database is updated but you are redirected, 
    // it's because this console.log (in your terminal) says 'false'
    console.log("SERVER AUTH CHECK:", {
        email: session?.user?.email,
        isWorker: session?.user?.isWorker
    });

    if (!session || session.user?.isWorker !== true) {
        redirect("/");
    }

    return <>{children}</>;
}