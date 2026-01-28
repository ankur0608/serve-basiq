"use client";

import LoginModal from "@/components/auth/LoginModal";
import OtpModal from "@/components/auth/OtpModal";
import NameModal from "@/components/auth/NameModal"; // ✅ Import this
import { useUIStore } from "@/lib/store";

export default function ModalProvider() {
    const {
        isLoginOpen,
        isOtpOpen,
        isNameOpen, // ✅ Get name modal state
        onCloseLogin,
        onCloseOtp,
        onCloseName, // ✅ Get name modal close action
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

            {/* ✅ Render Name Modal */}
            <NameModal
                isOpen={isNameOpen}
                onClose={onCloseName}
            />
        </>
    );
}