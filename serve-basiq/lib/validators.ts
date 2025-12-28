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
    // ✅ New Location Fields
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const serviceSettingsSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    subCategoryIds: z.array(z.string()).optional(), // Matches String[] in Prisma

    // Address
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),

    // Location (Converted to numbers)
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusKm: z.number().min(1, "Radius must be at least 1km"),

    // Schedule
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