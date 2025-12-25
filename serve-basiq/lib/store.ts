"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ================= TYPES ================= */

export interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  createdAt?: string;
}

interface User {
  id: string;
  phone: string;
  isWebsite: boolean;
  // ✅ ADD THIS
  email?: string | null;

  name?: string | null;
  role: string;

  isPhoneVerified: boolean;
  isWorker: boolean;
  isVerified: boolean;

  // ✅ ADD THIS (from API)
  addresses?: Address[];

  createdAt?: string;
  updatedAt?: string;
}

/* ================= STORE ================= */

export interface UIState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  mobileNumber: string;
  devOtp?: string;
  isLoginOpen: boolean;
  isOtpOpen: boolean;

  onOpenOtp: (phone: string, otp?: string) => void;
  onCloseOtp: () => void;
  onOpenLogin: () => void;
  onCloseLogin: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      mobileNumber: "",
      devOtp: undefined,
      isLoginOpen: false,
      isOtpOpen: false,

      onOpenOtp: (phone, otp) =>
        set({
          mobileNumber: phone,
          devOtp: otp,
          isLoginOpen: false,
          isOtpOpen: true,
        }),

      onCloseOtp: () =>
        set({
          mobileNumber: "",
          devOtp: undefined,
          isOtpOpen: false,
        }),

      onOpenLogin: () =>
        set({
          isLoginOpen: true,
          isOtpOpen: false,
          devOtp: undefined,
        }),

      onCloseLogin: () =>
        set({
          isLoginOpen: false,
          devOtp: undefined,
        }),
    }),
    {
      name: "servemate-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
