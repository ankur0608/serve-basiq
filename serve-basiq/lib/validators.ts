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
    // Basic Details
    name: z.string().min(3, "Service Brand Name is required"),
    desc: z.string().min(10, "Description must be at least 10 chars"),
    price: z.number().min(0, "Price cannot be negative"),
    experience: z.string().optional(), // e.g., "5 Years"
    altPhone: z.string().optional(),

    // Category
    categoryId: z.string().min(1, "Category is required"),
    subCategoryIds: z.array(z.string()).default([]), // Defaults to empty array if missing

    // Address
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),

    // Location (Maps)
    latitude: z.number().min(-90).max(90, "Invalid Latitude"),
    longitude: z.number().min(-180).max(180, "Invalid Longitude"),
    radiusKm: z.number().min(1, "Radius must be at least 1km").default(10),

    // Schedule
    workingDays: z.array(z.string()).min(1, "Select at least one working day"),
    openTime: z.string().min(1, "Open time is required"),
    closeTime: z.string().min(1, "Close time is required"),
});
export const verificationSchema = z.object({
    bankAccountHolder: z.string().min(2, "Account Holder Name is required"),
    bankAccountNumber: z.string().min(5, "Account Number is required"),
    bankIfsc: z.string().min(4, "IFSC Code is required"),
    bankName: z.string().min(2, "Bank Name is required"),

    // ✅ ADD THIS: Allow UPI ID (Optional)
    upiId: z.string().optional().or(z.literal("")),

    idProofType: z.string(),
    idProofNumber: z.string().min(4, "ID Number is required"),
    idProofImg: z.string().url("ID Proof image required"),

    // ✅ ADD THIS: Allow Business Proof Image (Optional)
    businessProofImg: z.string().optional().or(z.literal("")),
});