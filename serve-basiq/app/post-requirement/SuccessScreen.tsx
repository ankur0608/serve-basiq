import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuccessScreen() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Request Posted!</h2>
                <p className="text-slate-500 mt-2 mb-8 text-sm">
                    We have received your requirement. Providers will contact you shortly.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}