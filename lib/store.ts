import { create } from 'zustand';

interface UIState {
  isLoginOpen: boolean;
  isOtpOpen: boolean;
  mobileNumber: string; // Store number to show in OTP modal
  onOpenLogin: () => void;
  onCloseLogin: () => void;
  onOpenOtp: (number: string) => void;
  onCloseOtp: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginOpen: false,
  isOtpOpen: false,
  mobileNumber: '',
  onOpenLogin: () => set({ isLoginOpen: true, isOtpOpen: false }),
  onCloseLogin: () => set({ isLoginOpen: false }),
  onOpenOtp: (number) => set({ isOtpOpen: true, isLoginOpen: false, mobileNumber: number }),
  onCloseOtp: () => set({ isOtpOpen: false }),
}));