"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ================= TYPES ================= */

export interface Address {
  id: string;
  userId: string;
  type: "Home" | "Work" | "Other" | string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  createdAt?: string;
}

export interface User {
  id: string;
  phone: string;

  // Personal Info
  name: string | null;
  email: string | null;
  img: string | null; // Changed from 'image' to 'img' to match Prisma
  role: string;       // "USER" | "ADMIN"

  // Status Flags
  isPhoneVerified: boolean;
  isWorker: boolean;
  isVerified: boolean;
  isWebsite: boolean;

  // Relations
  addresses?: Address[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/* ================= STORE ================= */

export interface UIState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  // Auth Modal State
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
      // Only persist the currentUser, not the UI state (modals)
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);