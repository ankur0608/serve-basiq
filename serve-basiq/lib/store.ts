"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

  name: string | null;
  email: string | null;
  img: string | null;
  role: string;

  // ✅ MATCH DATABASE NAMES
  dob?: string | Date | null;
  preferredLanguage?: string | null;

  providerType?: "SERVICE" | "PRODUCT" | "BOTH" | string;

  isPhoneVerified: boolean;
  isWorker: boolean;
  isVerified: boolean;
  isWebsite: boolean;

  addresses?: Address[];

  createdAt?: string;
  updatedAt?: string;
}

export interface UIState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  loginIntent: "user" | "provider";
  setLoginIntent: (intent: "user" | "provider") => void;

  // ✅ New Temporary Name State
  tempName: string;
  setTempName: (name: string) => void;

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

      loginIntent: "user",
      setLoginIntent: (intent) => set({ loginIntent: intent }),

      // ✅ Initialize Temp Name
      tempName: "",
      setTempName: (name) => set({ tempName: name }),

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
          tempName: "", // Clear name on close
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
          tempName: "", // Clear name on close
        }),
    }),
    {
      name: "servemate-storage",
      storage: createJSONStorage(() => localStorage),

      // Only persist currentUser (don't persist UI states like modals or tempName)
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);