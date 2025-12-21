"use client";

import { create } from "zustand";

interface OtpStore {
  /** Mobile number entered in login */
  mobileNumber: string;

  /** DEV ONLY: OTP returned from backend */
  devOtp?: string;

  /** Open OTP modal with phone + optional dev OTP */
  onOpenOtp: (phone: string, otp?: string) => void;

  /** Close OTP modal and clear data */
  onCloseOtp: () => void;

  /** Open Login modal again */
  onOpenLogin: () => void;

  /** UI flags (optional but useful) */
  isLoginOpen: boolean;
  isOtpOpen: boolean;
}

export const useUIStore = create<OtpStore>((set) => ({
  mobileNumber: "",
  devOtp: undefined,

  isLoginOpen: false,
  isOtpOpen: false,

  /** Called from LoginModal */
  onOpenOtp: (phone, otp) =>
    set({
      mobileNumber: phone,
      devOtp: otp,
      isLoginOpen: false,
      isOtpOpen: true,
    }),

  /** Called after OTP verified or modal closed */
  onCloseOtp: () =>
    set({
      mobileNumber: "",
      devOtp: undefined,
      isOtpOpen: false,
    }),

  /** Back button from OTP modal */
  onOpenLogin: () =>
    set({
      isLoginOpen: true,
      isOtpOpen: false,
      devOtp: undefined,
    }),
}));
