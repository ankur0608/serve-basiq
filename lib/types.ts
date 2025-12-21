// lib/types.ts - TypeScript types for the marketplace

// ==================== ENUMS ====================

export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'DELETED';
export type BookingStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type LeadStatus = 'OPEN' | 'PURCHASED' | 'CLOSED' | 'EXPIRED';
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionSource = 'SERVICE' | 'LEAD' | 'REFUND' | 'PAYOUT' | 'ORDER' | 'TOPUP';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

// ==================== INTERFACES ====================

export interface User {
    id: string;
    mobile: string;
    email: string | null;
    passwordHash: string | null;
    name: string | null;
    avatar: string | null;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Provider {
    id: string;
    userId: string;
    businessName: string;
    description: string | null;
    isVerified: boolean;
    rating: number;
    totalReviews: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Address {
    id: string;
    userId: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface ServiceCategory {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
}

export interface Service {
    id: string;
    name: string;
    categoryId: string;
    description: string | null;
    basePrice: number;
    image: string | null;
    isActive: boolean;
}

export interface ServiceBooking {
    id: string;
    customerId: string;
    providerId: string;
    serviceId: string;
    addressId: string | null;
    price: number;
    status: BookingStatus;
    bookingDate: Date;
    bookingTime: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Lead {
    id: string;
    customerId: string;
    title: string;
    description: string;
    category: string;
    budget: number | null;
    location: string | null;
    status: LeadStatus;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductCategory {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
}

export interface Product {
    id: string;
    name: string;
    categoryId: string;
    description: string | null;
    price: number;
    moq: string | null;
    supplier: string | null;
    image: string | null;
    gallery: string[];
    isActive: boolean;
}

export interface Order {
    id: string;
    customerId: string;
    addressId: string | null;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    type: TransactionType;
    source: TransactionSource;
    amount: number;
    referenceId: string | null;
    description: string | null;
    createdAt: Date;
}

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
}

export interface Review {
    id: string;
    bookingId: string;
    userId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
}

export interface PayoutRequest {
    id: string;
    providerId: string;
    amount: number;
    status: PayoutStatus;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
