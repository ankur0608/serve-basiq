"use client";

import LoginModal from "@/components/auth/LoginModal";
import OtpModal from "@/components/auth/OtpModal";
import NameModal from "@/components/auth/NameModal";
import { useUIStore } from "@/lib/store";

export default function ModalProvider() {
    const {
        isLoginOpen,
        isOtpOpen,
        isNameOpen,
        onCloseLogin,
        onCloseOtp,
        onCloseName,
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
            <NameModal
                isOpen={isNameOpen}
                onClose={onCloseName}
            />
        </>
    );
}