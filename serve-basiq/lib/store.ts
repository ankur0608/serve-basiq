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

  tempName: string;
  setTempName: (name: string) => void;

  mobileNumber: string;
  devOtp?: string;
  isNewUser: boolean;

  // ✅ MODAL VISIBILITY STATES
  isLoginOpen: boolean;
  isOtpOpen: boolean;
  isNameOpen: boolean;
  isEditProfileOpen: boolean; // 🆕 ADDED THIS

  // ✅ ACTIONS
  onOpenOtp: (phone: string, otp?: string, isNewUser?: boolean) => void;
  onCloseOtp: () => void;

  onOpenLogin: () => void;
  onCloseLogin: () => void;

  onOpenName: () => void;
  onCloseName: () => void;

  // 🆕 EDIT PROFILE ACTIONS
  onOpenEditProfile: () => void;
  onCloseEditProfile: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      loginIntent: "user",
      setLoginIntent: (intent) => set({ loginIntent: intent }),

      tempName: "",
      setTempName: (name) => set({ tempName: name }),

      mobileNumber: "",
      devOtp: undefined,
      isNewUser: false,

      // Initial Modal States
      isLoginOpen: false,
      isOtpOpen: false,
      isNameOpen: false,
      isEditProfileOpen: false, // 🆕 Initialize as false

      onOpenOtp: (phone, otp, isNewUser) =>
        set({
          mobileNumber: phone,
          devOtp: otp,
          isNewUser: isNewUser || false,
          isLoginOpen: false,
          isOtpOpen: true,
          isNameOpen: false,
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
          isNameOpen: false,
          devOtp: undefined,
          isNewUser: false,
        }),

      onCloseLogin: () =>
        set({
          isLoginOpen: false,
          devOtp: undefined,
          tempName: "",
          isNewUser: false,
          isNameOpen: false,
        }),

      onOpenName: () =>
        set({
          isNameOpen: true,
          isOtpOpen: false,
          isLoginOpen: false,
        }),

      onCloseName: () =>
        set({
          isNameOpen: false,
          isNewUser: false,
          tempName: "",
        }),

      // 🆕 IMPLEMENTATION FOR EDIT PROFILE MODAL
      onOpenEditProfile: () => set({ isEditProfileOpen: true }),
      onCloseEditProfile: () => set({ isEditProfileOpen: false }),
    }),
    {
      name: "servemate-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);