"use client";

import { create } from "zustand";

export interface UIState {
  mobileNumber: string;
  devOtp?: string;

  isLoginOpen: boolean;
  isOtpOpen: boolean;

  onOpenOtp: (phone: string, otp?: string) => void;
  onCloseOtp: () => void;

  onOpenLogin: () => void;
  onCloseLogin: () => void; // ✅ ADD THIS
}


export const useUIStore = create<UIState>((set) => ({
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
}));

