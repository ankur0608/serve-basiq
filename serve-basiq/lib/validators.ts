import { z } from "zod";

// --- ENUMS ---
const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
const PriceTypeEnum = z.enum(["FIXED", "HOURLY"]);
const PayoutMethodEnum = z.enum(["BANK", "UPI"]);

// --- 1. USER ONBOARDING SCHEMA ---
export const onboardSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    profileImage: z.string().url("Profile image is required"),
    gender: GenderEnum.optional(),
    dob: z.coerce.date().optional(),
    preferredLanguage: z.string().default("English"),

    // Address
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode"),
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

    // Images
    serviceimg: z.string().min(1, "Main Service Image is required"),
    mainimg: z.string().optional(),
    coverImg: z.string().optional(),

    // ✅ ADDED GALLERY & SOCIAL FIELDS (Fixes Validation Errors)
    gallery: z.array(z.string()).optional().default([]),
    instagramUrl: z.string().optional().or(z.literal("")),
    facebookUrl: z.string().optional().or(z.literal("")),
    websiteUrl: z.string().optional().or(z.literal("")),
    youtubeUrl: z.string().optional().or(z.literal("")),

    // Category
    categoryId: z.string().min(1, "Category is required"),
    subCategoryIds: z.array(z.string()).default([]),

    // Address
    addressLine1: z.string().optional().or(z.literal("")),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    pincode: z.string().optional().or(z.literal("")),

    // Location (Maps)
    latitude: z.number().min(-90).max(90).optional().or(z.literal(0)),
    longitude: z.number().min(-180).max(180).optional().or(z.literal(0)),
    radiusKm: z.coerce.number().min(1).default(10),

    // Schedule
    workingDays: z.array(z.string()).min(1, "Select at least one working day"),
    openTime: z.string().min(1, "Open time is required"),
    closeTime: z.string().min(1, "Close time is required"),
});

// --- 3. VERIFICATION SCHEMA ---
export const verificationSchema = z.object({
    bankAccountHolder: z.string().min(2, "Account Holder Name is required"),
    bankAccountNumber: z.string().min(5, "Account Number is required"),
    bankIfsc: z.string().min(4, "IFSC Code is required"),
    bankName: z.string().min(2, "Bank Name is required"),
    upiId: z.string().optional().or(z.literal("")),
    preferredPayoutMethod: PayoutMethodEnum.default("BANK"),
    idProofType: z.string().default("Aadhaar"),
    idProofNumber: z.string().min(4, "ID Number is required"),
    idProofFrontImg: z.string().url("ID Front image is required"),
    idProofBackImg: z.string().url("ID Back image is required").optional().or(z.literal("")),
    businessProofImg: z.string().optional().or(z.literal("")),
    gstRegistered: z.boolean().default(false),
    gstNumber: z.string().optional().or(z.literal("")),
}).refine((data) => {
    if (data.gstRegistered && (!data.gstNumber || data.gstNumber.length < 5)) {
        return false;
    }
    return true;
}, {
    message: "GST Number is required when registered",
    path: ["gstNumber"],
});