import { Suspense } from 'react';
import LoginCard from '@/components/login/LoginCard'; // Make sure path matches where you saved file 1

// Helper component for loading state
function LoadingState() {
    return (
        <div className="w-full max-w-md bg-white h-[500px] rounded-3xl shadow-xl animate-pulse" />
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
            <Suspense fallback={<LoadingState />}>
                <LoginCard />
            </Suspense>
        </div>
    );
}