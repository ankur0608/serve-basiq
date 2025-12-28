// lib/validators.ts
import { z } from "zod";

export const onboardSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    altPhone: z.string().optional(),
    img: z.string().url("Profile image is required"),
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode"),
});

export const serviceSettingsSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    radiusKm: z.number().min(1).max(100),
    addressLine1: z.string().min(5),
    city: z.string().min(2),
    latitude: z.number(),
    longitude: z.number(),
    workingDays: z.array(z.string()).min(1, "Select at least one day"),
    openTime: z.string(),
    closeTime: z.string(),
});

export const verificationSchema = z.object({
    bankAccountHolder: z.string().min(2),
    bankAccountNumber: z.string().min(5),
    bankIfsc: z.string().min(4),
    bankName: z.string().min(2),
    idProofType: z.string(),
    idProofNumber: z.string().min(4),
    idProofImg: z.string().url("ID Proof image required"),
});