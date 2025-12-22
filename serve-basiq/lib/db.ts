// lib/db.ts - Mock database with dummy data for development
// This allows the app to run without a real database connection

import {
    UserRole, UserStatus, BookingStatus, LeadStatus,
    OrderStatus, TransactionType, TransactionSource, PayoutStatus
} from './types';

// ==================== DUMMY DATA ====================

export const users = [
    {
        id: 'user-1',
        mobile: '9876543210',
        email: 'john@example.com',
        passwordHash: null,
        name: 'John Doe',
        avatar: null,
        role: 'CUSTOMER' as UserRole,
        status: 'ACTIVE' as UserStatus,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'user-2',
        mobile: '9876543211',
        email: 'provider@example.com',
        passwordHash: null,
        name: 'Mike Wilson',
        avatar: null,
        role: 'PROVIDER' as UserRole,
        status: 'ACTIVE' as UserStatus,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: 'user-3',
        mobile: '9876543212',
        email: 'admin@example.com',
        passwordHash: null,
        name: 'Admin User',
        avatar: null,
        role: 'ADMIN' as UserRole,
        status: 'ACTIVE' as UserStatus,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

export const providers = [
    {
        id: 'provider-1',
        userId: 'user-2',
        businessName: "Mike's Plumbing",
        description: 'Professional plumbing services with 15+ years experience',
        isVerified: true,
        rating: 4.9,
        totalReviews: 127,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: 'provider-2',
        userId: 'user-4',
        businessName: 'Elite Cleaners',
        description: 'Top-rated cleaning service using eco-friendly products',
        isVerified: true,
        rating: 5.0,
        totalReviews: 89,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
    },
];

export const serviceCategories = [
    { id: 'cat-1', name: 'Plumbing', icon: 'wrench', color: 'bg-blue-100 text-blue-600' },
    { id: 'cat-2', name: 'Cleaning', icon: 'broom', color: 'bg-green-100 text-green-600' },
    { id: 'cat-3', name: 'Electrical', icon: 'bolt', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'cat-4', name: 'Painting', icon: 'paint', color: 'bg-purple-100 text-purple-600' },
    { id: 'cat-5', name: 'HVAC', icon: 'fan', color: 'bg-sky-100 text-sky-600' },
    { id: 'cat-6', name: 'Moving', icon: 'truck', color: 'bg-red-100 text-red-600' },
];

export const services = [
    {
        id: 'service-1',
        name: 'Pipe Repair',
        categoryId: 'cat-1',
        description: 'Fix leaky pipes, unclog drains, and general pipe repairs',
        basePrice: 450,
        image: 'https://images.unsplash.com/photo-1505798577917-a651a5d40318?w=800&q=80',
        isActive: true,
    },
    {
        id: 'service-2',
        name: 'Deep Cleaning',
        categoryId: 'cat-2',
        description: 'Complete home deep cleaning with eco-friendly products',
        basePrice: 300,
        image: 'https://images.unsplash.com/photo-1581578731117-10d52143b0d8?w=800&q=80',
        isActive: true,
    },
    {
        id: 'service-3',
        name: 'Wiring Installation',
        categoryId: 'cat-3',
        description: 'New wiring, circuit breaker installation, electrical repairs',
        basePrice: 600,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
        isActive: true,
    },
];

export const productCategories = [
    { id: 'pcat-1', name: 'Industrial', icon: 'industry', color: 'bg-slate-100 text-slate-600' },
    { id: 'pcat-2', name: 'Safety', icon: 'helmet', color: 'bg-orange-100 text-orange-600' },
    { id: 'pcat-3', name: 'Packaging', icon: 'box', color: 'bg-amber-100 text-amber-600' },
];

export const products = [
    {
        id: 'product-1',
        name: 'CNC Lathe Machine X200',
        categoryId: 'pcat-1',
        description: 'High-precision CNC lathe with automated tool changing',
        price: 150000,
        moq: '1 Unit',
        supplier: 'Global Machineries Ltd.',
        image: 'https://images.unsplash.com/photo-1616789916666-88062400db46?w=800',
        gallery: [],
        isActive: true,
    },
    {
        id: 'product-2',
        name: 'Industrial Safety Helmets',
        categoryId: 'pcat-2',
        description: 'ISO certified hard hats made from reinforced ABS material',
        price: 450,
        moq: '50 Pcs',
        supplier: 'SafeGear Pro',
        image: 'https://images.unsplash.com/photo-1596512296092-23c89658e23f?w=800',
        gallery: [],
        isActive: true,
    },
    {
        id: 'product-3',
        name: 'Corrugated Shipping Boxes',
        categoryId: 'pcat-3',
        description: '3-ply heavy duty shipping boxes, eco-friendly and recyclable',
        price: 15,
        moq: '500 Pcs',
        supplier: 'PackIt Well Inc.',
        image: 'https://images.unsplash.com/photo-1606856108154-1ae0248231c5?w=800',
        gallery: [],
        isActive: true,
    },
];

export const bookings = [
    {
        id: 'booking-1',
        customerId: 'user-1',
        providerId: 'provider-1',
        serviceId: 'service-1',
        addressId: 'addr-1',
        price: 450,
        status: 'COMPLETED' as BookingStatus,
        bookingDate: new Date('2024-12-18'),
        bookingTime: '10:00 AM',
        notes: 'Kitchen sink is leaking',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-18'),
    },
    {
        id: 'booking-2',
        customerId: 'user-1',
        providerId: 'provider-1',
        serviceId: 'service-1',
        addressId: 'addr-1',
        price: 500,
        status: 'SCHEDULED' as BookingStatus,
        bookingDate: new Date('2024-12-22'),
        bookingTime: '2:00 PM',
        notes: 'Bathroom pipe replacement',
        createdAt: new Date('2024-12-19'),
        updatedAt: new Date('2024-12-19'),
    },
];

export const reviews = [
    {
        id: 'review-1',
        providerId: 'provider-1',
        customerId: 'user-1',
        rating: 5,
        comment: "Excellent service! Arrived on time and did a great job.",
        createdAt: new Date('2024-12-10')
    },
    {
        id: 'review-2',
        providerId: 'provider-2',
        customerId: 'user-1',
        rating: 4,
        comment: "Very professional cleaning service.",
        createdAt: new Date('2024-12-12')
    }
];

export const leads = [
    {
        id: 'lead-1',
        customerId: 'user-1',
        title: 'Need AC repair urgently',
        description: 'Split AC not cooling properly, making noise',
        category: 'HVAC',
        budget: 2000,
        location: 'Mumbai, Maharashtra',
        status: 'OPEN' as LeadStatus,
        expiresAt: new Date('2024-12-30'),
        createdAt: new Date('2024-12-19'),
        updatedAt: new Date('2024-12-19'),
    },
    {
        id: 'lead-2',
        customerId: 'user-1',
        title: 'Full home painting',
        description: '3BHK apartment needs complete interior painting',
        category: 'Painting',
        budget: 25000,
        location: 'Delhi',
        status: 'OPEN' as LeadStatus,
        expiresAt: new Date('2024-12-28'),
        createdAt: new Date('2024-12-17'),
        updatedAt: new Date('2024-12-17'),
    },
];

export const orders = [
    {
        id: 'order-1',
        customerId: 'user-1',
        addressId: 'addr-1',
        totalAmount: 22500,
        status: 'DELIVERED' as OrderStatus,
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-15'),
    },
    {
        id: 'order-2',
        customerId: 'user-1',
        addressId: 'addr-1',
        totalAmount: 7500,
        status: 'SHIPPED' as OrderStatus,
        createdAt: new Date('2024-12-18'),
        updatedAt: new Date('2024-12-19'),
    },
];

export const orderItems = [
    { id: 'oi-1', orderId: 'order-1', productId: 'product-2', quantity: 50, price: 450 },
    { id: 'oi-2', orderId: 'order-2', productId: 'product-3', quantity: 500, price: 15 },
];

export const wallets = [
    {
        id: 'wallet-1',
        userId: 'user-1',
        balance: 5000,
        currency: 'INR',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-19'),
    },
    {
        id: 'wallet-2',
        userId: 'user-2',
        balance: 15000,
        currency: 'INR',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-12-19'),
    },
];

export const walletTransactions = [
    {
        id: 'txn-1',
        walletId: 'wallet-1',
        type: 'CREDIT' as TransactionType,
        source: 'TOPUP' as TransactionSource,
        amount: 5000,
        referenceId: null,
        description: 'Wallet top-up',
        createdAt: new Date('2024-12-15'),
    },
    {
        id: 'txn-2',
        walletId: 'wallet-2',
        type: 'CREDIT' as TransactionType,
        source: 'SERVICE' as TransactionSource,
        amount: 450,
        referenceId: 'booking-1',
        description: 'Earnings from booking',
        createdAt: new Date('2024-12-18'),
    },
];

export const addresses = [
    {
        id: 'addr-1',
        userId: 'user-1',
        label: 'Home',
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
        createdAt: new Date('2024-01-15'),
    },
];

export const cart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [
        { id: 'ci-1', productId: 'product-2', quantity: 100 },
    ],
};

// ==================== MOCK DB FUNCTIONS ====================

// Simulate current logged-in user (for demo)
let currentUserId = 'user-1';

export const mockDb = {
    getCurrentUser: () => users.find(u => u.id === currentUserId),
    setCurrentUser: (userId: string) => { currentUserId = userId; },

    users: {
        findMany: () => users,
        findById: (id: string) => users.find(u => u.id === id),
        findByMobile: (mobile: string) => users.find(u => u.mobile === mobile),
    },

    providers: {
        findMany: () => providers,
        findById: (id: string) => providers.find(p => p.id === id),
        findByUserId: (userId: string) => providers.find(p => p.userId === userId),
    },

    services: {
        findMany: () => services,
        findById: (id: string) => services.find(s => s.id === id),
        findByCategory: (catId: string) => services.filter(s => s.categoryId === catId),
    },

    serviceCategories: {
        findMany: () => serviceCategories,
        findById: (id: string) => serviceCategories.find(c => c.id === id),
    },

    products: {
        findMany: () => products,
        findById: (id: string) => products.find(p => p.id === id),
        findByCategory: (catId: string) => products.filter(p => p.categoryId === catId),
    },

    productCategories: {
        findMany: () => productCategories,
        findById: (id: string) => productCategories.find(c => c.id === id),
    },

    bookings: {
        findMany: () => bookings,
        findById: (id: string) => bookings.find(b => b.id === id),
        findByCustomer: (customerId: string) => bookings.filter(b => b.customerId === customerId),
        findByProvider: (providerId: string) => bookings.filter(b => b.providerId === providerId),
    },

    leads: {
        findMany: () => leads,
        findById: (id: string) => leads.find(l => l.id === id),
        findOpen: () => leads.filter(l => l.status === 'OPEN'),
    },

    orders: {
        findMany: () => orders,
        findById: (id: string) => orders.find(o => o.id === id),
        findByCustomer: (customerId: string) => orders.filter(o => o.customerId === customerId),
        getItems: (orderId: string) => orderItems.filter(oi => oi.orderId === orderId),
    },

    wallets: {
        findByUser: (userId: string) => wallets.find(w => w.userId === userId),
        getTransactions: (walletId: string) => walletTransactions.filter(t => t.walletId === walletId),
    },

    addresses: {
        findByUser: (userId: string) => addresses.filter(a => a.userId === userId),
        findById: (id: string) => addresses.find(a => a.id === id),
    },

    cart: {
        getByUser: (userId: string) => userId === cart.userId ? cart : null,
    },
};

export default mockDb;
