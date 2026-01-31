"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Define a simple Address type for the array
export interface Address {
  id: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}
// ✅ 1. Define the User interface with explicit flattened address fields
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  img: string | null;
  profileImage?: string | null; // Redundant key for safety

  role: string;
  providerType?: "SERVICE" | "PRODUCT" | "BOTH" | string;

  isPhoneVerified: boolean;
  isWorker: boolean;
  isVerified: boolean;
  isWebsite: boolean;
  addresses?: Address[];
  // Flattened Address Fields (Matches API response)
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  dob?: string | Date | null;
  dateOfBirth?: string; // Alias for frontend forms
  preferredLanguage?: string | null;

  // Flag to check if we have fetched full details from DB
  isFullProfile?: boolean;
}

export interface UIState {
  currentUser: User | null;
  lastFetched: number | null;

  setCurrentUser: (user: User | null) => void;
  setLastFetched: (time: number | null) => void;
  logout: () => void;

  loginIntent: "user" | "provider";
  setLoginIntent: (intent: "user" | "provider") => void;

  tempName: string;
  setTempName: (name: string) => void;

  mobileNumber: string;
  devOtp?: string;
  isNewUser: boolean;

  isLoginOpen: boolean;
  isOtpOpen: boolean;
  isNameOpen: boolean;
  isEditProfileOpen: boolean;

  onOpenOtp: (phone: string, otp?: string, isNewUser?: boolean) => void;
  onCloseOtp: () => void;
  onOpenLogin: () => void;
  onCloseLogin: () => void;
  onOpenName: () => void;
  onCloseName: () => void;
  onOpenEditProfile: () => void;
  onCloseEditProfile: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentUser: null,
      lastFetched: null,

      setCurrentUser: (user) => set({ currentUser: user, lastFetched: Date.now() }),
      setLastFetched: (time) => set({ lastFetched: time }),
      logout: () => set({ currentUser: null, lastFetched: null }),

      loginIntent: "user",
      setLoginIntent: (intent) => set({ loginIntent: intent }),

      tempName: "",
      setTempName: (name) => set({ tempName: name }),

      mobileNumber: "",
      devOtp: undefined,
      isNewUser: false,

      isLoginOpen: false,
      isOtpOpen: false,
      isNameOpen: false,
      isEditProfileOpen: false,

      onOpenOtp: (phone, otp, isNewUser) =>
        set({
          mobileNumber: phone,
          devOtp: otp,
          isNewUser: isNewUser || false,
          isLoginOpen: false,
          isOtpOpen: true,
          isNameOpen: false,
        }),

      onCloseOtp: () => set({ mobileNumber: "", devOtp: undefined, isOtpOpen: false }),

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

      onOpenName: () => set({ isNameOpen: true, isOtpOpen: false, isLoginOpen: false }),
      onCloseName: () => set({ isNameOpen: false, isNewUser: false, tempName: "" }),

      onOpenEditProfile: () => set({ isEditProfileOpen: true }),
      onCloseEditProfile: () => set({ isEditProfileOpen: false }),
    }),
    {
      name: "servemate-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        lastFetched: state.lastFetched,
      }),
    }
  )
);