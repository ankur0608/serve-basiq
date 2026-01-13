// 'use client';

// import { useState, useEffect } from 'react';
// import { createPortal } from 'react-dom'; // ✅ Import this
// import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
// import ProductRequestForm from './ProductRequestForm';
// import { useRouter } from 'next/navigation';

// interface Props {
//     productId: string;
//     productName: string;
//     productPrice: number;
//     productUnit: string;
//     moq: number;
//     currentUserId?: string;
//     userAddresses: any[];
// }

// export default function ProductWrapper({
//     productId,
//     productName,
//     productPrice,
//     productUnit,
//     moq,
//     currentUserId,
//     userAddresses
// }: Props) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [mounted, setMounted] = useState(false); // ✅ Prevent hydration mismatch
//     const router = useRouter();

//     // ✅ Ensure we only run portal logic on the client
//     useEffect(() => {
//         setMounted(true);
//     }, []);

//     const handleOpen = () => {
//         if (!currentUserId) {
//             router.push('/login?callbackUrl=' + window.location.pathname);
//             return;
//         }
//         setIsOpen(true);
//     };

//     return (
//         <>
//             {/* 1. THE TRIGGER BUTTON (Stays inside the Bottom Bar) */}
//             <button
//                 onClick={handleOpen}
//                 className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2"
//             >
//                 Request Quote <FaPaperPlane />
//             </button>

//             {/* 2. THE MODAL (Teleported to document.body) */}
//             {isOpen && mounted && createPortal(
//                 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//                     <div className="relative w-full max-w-md">
//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
//                         >
//                             <FaXmark size={24} />
//                         </button>

//                         <ProductRequestForm
//                             productId={productId}
//                             productName={productName}
//                             price={productPrice}
//                             unit={productUnit}
//                             moq={moq}
//                             userId={currentUserId!}
//                             userAddresses={userAddresses}
//                             onRequestClose={() => setIsOpen(false)}
//                         />
//                     </div>
//                 </div>,
//                 document.body // 👈 This forces it to attach to the main body, ignoring parent styles
//             )}
//         </>
//     );
// }

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // ✅ Import Portal for overlay
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import ProductRequestForm from './ProductRequestForm';
import { useRouter } from 'next/navigation';

interface Props {
    productId: string;
    productName: string;
    productPrice: number;
    productUnit: string;
    moq: number;
    currentUserId?: string;
    userAddresses: any[];
}

export default function ProductWrapper({
    productId,
    productName,
    productPrice,
    productUnit,
    moq,
    currentUserId,
    userAddresses
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false); // ✅ Prevent hydration mismatch
    const router = useRouter();

    // ✅ Ensure we only run portal logic on the client
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpen = () => {
        // if (!currentUserId) {
        //     router.push('/login?callbackUrl=' + window.location.pathname);
        //     return;
        // }
        setIsOpen(true);
    };

    return (
        <>
            {/* 1. THE TRIGGER BUTTON (Stays inside the Bottom Bar) */}
            <button
                onClick={handleOpen}
                className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2"
            >
                Request Quote <FaPaperPlane />
            </button>

            {/* 2. THE MODAL (Teleported to document.body) */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
                        >
                            <FaXmark size={24} />
                        </button>

                        <ProductRequestForm
                            productId={productId}
                            productName={productName}
                            price={productPrice}
                            unit={productUnit}
                            moq={moq}
                            userId={currentUserId!}
                            userAddresses={userAddresses}
                            onRequestClose={() => setIsOpen(false)}
                        />
                    </div>
                </div>,
                document.body // 👈 This forces it to attach to the main body, ignoring parent styles
            )}
        </>
    );
}