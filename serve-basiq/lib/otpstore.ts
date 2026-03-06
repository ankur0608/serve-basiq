"use client";

import { create } from "zustand";

interface OtpStore {
  mobileNumber: string;

  devOtp?: string;

  onOpenOtp: (phone: string, otp?: string) => void;

  onCloseOtp: () => void;

  onOpenLogin: () => void;

  isLoginOpen: boolean;
  isOtpOpen: boolean;
}

export const useUIStore = create<OtpStore>((set) => ({
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
}));
