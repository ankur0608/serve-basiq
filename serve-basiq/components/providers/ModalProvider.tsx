"use client";

import LoginModal from "@/components/auth/LoginModal";
import OtpModal from "@/components/auth/OtpModal";
import { useUIStore } from "@/lib/store";

export default function ModalProvider() {
    const {
        isLoginOpen,
        isOtpOpen,
        onCloseLogin,
        onCloseOtp,
    } = useUIStore();

    return (
        <>
            <LoginModal
                isOpen={isLoginOpen}
                onClose={onCloseLogin}
            />

            <OtpModal
                isOpen={isOtpOpen}
                onClose={onCloseOtp}
            />
        </>
    );
}
