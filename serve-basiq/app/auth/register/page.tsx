"use client";

import { useSession } from "next-auth/react";

export default function RegisterPage() {
    const { data: session } = useSession();

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Finish your Registration</h1>
            <p>Welcome, {session?.user?.email}</p>
            <p className="text-gray-500">
                (This is the /auth/register page your app was looking for)
            </p>
            {/* Add your form to collect Phone Number / Role here */}
        </div>
    );
}