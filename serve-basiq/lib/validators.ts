// lib/validators.ts
import { z } from "zod";

// --- ENUMS (Matching Prisma) ---
const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
const PriceTypeEnum = z.enum(["FIXED", "HOURLY"]);
const PayoutMethodEnum = z.enum(["BANK", "UPI"]);

// --- 1. USER ONBOARDING SCHEMA ---
export const onboardSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(), // Make sure this matches your auth flow

    // ✅ UPDATED: Profile Image (renamed from img)
    profileImage: z.string().url("Profile image is required"),

    // ✅ NEW: Personal Details
    gender: GenderEnum.optional(),
    dob: z.coerce.date().optional(), // Use coerce to handle string dates from forms
    preferredLanguage: z.string().default("English"),

    // ✅ UPDATED: Address Section (Added Landmark)
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(), // New field
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode"),

    // Location fields
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

// --- 2. SERVICE SETTINGS SCHEMA ---
export const serviceSettingsSchema = z.object({
    // Basic Details
    name: z.string().min(3, "Service Brand Name is required"),
    desc: z.string().min(10, "Description must be at least 10 chars"),

    // Price & Experience
    price: z.coerce.number().min(0, "Price cannot be negative"),
    priceType: PriceTypeEnum.default("FIXED"),
    experience: z.coerce.number().min(0, "Experience must be positive").optional(),

    altPhone: z.string().optional(),

    // ✅ UPDATED: Image Fields (Renamed img -> serviceimg)
    serviceimg: z.string().min(1, "Main Service Image is required"), // Renamed
    mainimg: z.string().optional(),
    coverImg: z.string().optional(),

    // Category
    categoryId: z.string().min(1, "Category is required"),
    subCategoryIds: z.array(z.string()).default([]),

    // Address
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),

    // Location (Maps)
    latitude: z.number().min(-90).max(90, "Invalid Latitude"),
    longitude: z.number().min(-180).max(180, "Invalid Longitude"),
    radiusKm: z.coerce.number().min(1, "Radius must be at least 1km").default(10),

    // Schedule
    workingDays: z.array(z.string()).min(1, "Select at least one working day"),
    openTime: z.string().min(1, "Open time is required"),
    closeTime: z.string().min(1, "Close time is required"),

    // ✅ NEW: Social Links
    instagramUrl: z.string().url().optional().or(z.literal("")),
    facebookUrl: z.string().url().optional().or(z.literal("")),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    youtubeUrl: z.string().url().optional().or(z.literal("")),
});

// --- 3. VERIFICATION (KYC & BANKING) SCHEMA ---
export const verificationSchema = z.object({
    // Banking Details
    bankAccountHolder: z.string().min(2, "Account Holder Name is required"),
    bankAccountNumber: z.string().min(5, "Account Number is required"),
    bankIfsc: z.string().min(4, "IFSC Code is required"),
    bankName: z.string().min(2, "Bank Name is required"),
    upiId: z.string().optional().or(z.literal("")),

    // ✅ NEW: Preferred Payout
    preferredPayoutMethod: PayoutMethodEnum.default("BANK"),

    // KYC Details
    idProofType: z.string().default("Aadhaar"),
    idProofNumber: z.string().min(4, "ID Number is required"),

    // ✅ UPDATED: ID Images (Front & Back)
    idProofFrontImg: z.string().url("ID Front image is required"), // Renamed
    idProofBackImg: z.string().url("ID Back image is required").optional().or(z.literal("")), // New

    // Business Proof
    businessProofImg: z.string().optional().or(z.literal("")),

    // ✅ NEW: GST Fields
    gstRegistered: z.boolean().default(false),
    gstNumber: z.string().optional().or(z.literal("")),
}).refine((data) => {
    // Custom validation: If GST Registered is true, GST Number is required
    if (data.gstRegistered && (!data.gstNumber || data.gstNumber.length < 5)) {
        return false;
    }
    return true;
}, {
    message: "GST Number is required when registered",
    path: ["gstNumber"],
});