"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  district?: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  img: string | null;
  image?: string | null;
  profileImage?: string | null;
  role: string;
  providerType?: "SERVICE" | "PRODUCT" | "BOTH" | string;

  isPhoneVerified: boolean;
  isWorker: boolean;
  isVerified: boolean;
  isWebsite: boolean;

  addresses?: Address[];

  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;

  dob?: string | Date | null;
  dateOfBirth?: string;
  preferredLanguage?: string | null;

  isFullProfile?: boolean;
}

interface UIState {
  currentUser: User | null;
  lastFetched: number;

  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  devOtp?: string; 
  loginIntent: "user" | "provider";
  setLoginIntent: (intent: "user" | "provider") => void;

  tempName: string;
  setTempName: (name: string) => void;

  mobileNumber: string;
  verificationId: string | null;
  isNewUser: boolean;

  isLoginOpen: boolean;
  isOtpOpen: boolean;
  isNameOpen: boolean;
  isEditProfileOpen: boolean;

  onOpenOtp: (phone: string, verificationId: string, isNewUser?: boolean) => void;
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
      lastFetched: 0,

      setCurrentUser: (user) => set({ currentUser: user, lastFetched: Date.now() }),

      logout: () => set({ currentUser: null, lastFetched: 0 }),

      loginIntent: "user",
      setLoginIntent: (intent) => set({ loginIntent: intent }),

      tempName: "",
      setTempName: (name) => set({ tempName: name }),

      mobileNumber: "",
      devOtp: undefined,
      verificationId: null,
      isNewUser: false,

      isLoginOpen: false,
      isOtpOpen: false,
      isNameOpen: false,
      isEditProfileOpen: false,

      // ✅ Store the verificationId from MessageCentral
      // onOpenOtp: (phone, verificationId, isNewUser) =>
      //   set({
      //     mobileNumber: phone,
      //     devOtp: undefined,
      //     verificationId: verificationId,
      //     isNewUser: isNewUser || false,
      //     isLoginOpen: false,
      //     isOtpOpen: true,
      //     isNameOpen: false,
      //   }),
      onOpenOtp: (phone, verificationId, isNewUser) => {
        const isDevOtp = verificationId && verificationId.length === 4 && !isNaN(Number(verificationId));

        set({
          mobileNumber: phone,
          verificationId: isDevOtp ? null : verificationId,
          devOtp: isDevOtp ? verificationId : undefined,
          isNewUser: isNewUser || false,
          isLoginOpen: false,
          isOtpOpen: true,
          isNameOpen: false,
        });
      },
      onCloseOtp: () => set({ mobileNumber: "", devOtp: undefined, isOtpOpen: false }),
      // onCloseOtp: () => set({ mobileNumber: "", verificationId: null, isOtpOpen: false }),

      onOpenLogin: () =>
        set({
          isLoginOpen: true,
          isOtpOpen: false,
          devOtp: undefined,
          isNameOpen: false,
          verificationId: null,
          isNewUser: false,
        }),

      onCloseLogin: () =>
        set({
          isLoginOpen: false,
          verificationId: null,
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