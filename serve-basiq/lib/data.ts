// lib/data.ts

// --- INTERFACES ---

export interface Review {
    u: string; // User name
    t: string; // Text/Comment
    r: number; // Rating
    date: string;
}

export interface Service {
    id: number;
    name: string;
    cat: string;
    img: string;
    price: number;
    rating: number;
    loc: string;
    verified: boolean;
    desc: string;
    social: { fb?: string; insta?: string; web?: string };
    gallery: string[];
    reviews: Review[];
}

export interface Product {
    id: number;
    name: string;
    cat: string;
    img: string;
    price: number;
    moq: string; // Minimum Order Quantity
    supplier: string;
    desc: string;
    gallery: string[];
}

export interface Category {
    name: string;
    icon: string; // We will map these strings to React Icons in the component
    color: string;
    type: 'service' | 'product';
}

// --- DATA ---

export const categories: Category[] = [
    // Service Categories
    { name: 'Plumbing', icon: 'wrench', color: 'bg-blue-100 text-blue-600', type: 'service' },
    { name: 'Cleaning', icon: 'broom', color: 'bg-green-100 text-green-600', type: 'service' },
    { name: 'Electrical', icon: 'bolt', color: 'bg-yellow-100 text-yellow-600', type: 'service' },
    { name: 'Painting', icon: 'paint', color: 'bg-purple-100 text-purple-600', type: 'service' },
    { name: 'Gardening', icon: 'leaf', color: 'bg-emerald-100 text-emerald-600', type: 'service' },
    { name: 'Moving', icon: 'truck', color: 'bg-red-100 text-red-600', type: 'service' },
    { name: 'HVAC', icon: 'fan', color: 'bg-sky-100 text-sky-600', type: 'service' },

    // Product Categories (B2B)
    { name: 'Industrial', icon: 'industry', color: 'bg-slate-100 text-slate-600', type: 'product' },
    { name: 'Safety', icon: 'helmet', color: 'bg-orange-100 text-orange-600', type: 'product' },
    { name: 'Packaging', icon: 'box', color: 'bg-amber-100 text-amber-600', type: 'product' },
];

export const services: Service[] = [
    {
        id: 1,
        name: "Mike's Plumbing",
        cat: 'Plumbing',
        img: "https://images.unsplash.com/photo-1505798577917-a651a5d40318?w=800&q=80",
        price: 450,
        rating: 4.9,
        loc: "Downtown, NY",
        verified: true,
        desc: "Professional plumbing services with over 15 years of experience. We handle everything from leaky faucets to major pipe installations. Emergency 24/7 support available.",
        social: { web: "https://mikesplumbing.com", fb: "#" },
        gallery: [
            "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400"
        ],
        reviews: [
            { u: "Sarah J.", t: "Fast and clean. Solved the leak in 30 mins.", r: 5, date: "2 days ago" },
            { u: "Tom H.", t: "A bit pricey but worth it for the quality.", r: 4, date: "1 week ago" }
        ]
    },
    {
        id: 2,
        name: "Elite Cleaners",
        cat: 'Cleaning',
        img: "https://images.unsplash.com/photo-1581578731117-10d52143b0d8?w=800&q=80",
        price: 300,
        rating: 5.0,
        loc: "Westside",
        verified: true,
        desc: "Top-rated home cleaning service using 100% eco-friendly products. We specialize in deep cleaning, moving-in/out cleaning, and office sanitation.",
        social: { insta: "#" },
        gallery: ["https://images.unsplash.com/photo-1527515637-62b9a8ab4d12?w=400"],
        reviews: [{ u: "Ben K.", t: "My house has never looked this good!", r: 5, date: "Yesterday" }]
    },
    {
        id: 3,
        name: "Volt Masters",
        cat: 'Electrical',
        img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
        price: 600,
        rating: 4.8,
        loc: "East End",
        verified: true,
        desc: "Certified master electricians. From wiring new homes to fixing circuit breakers, no job is too small. Licensed and insured.",
        social: { web: "#" },
        gallery: ["https://images.unsplash.com/photo-1558402529-d2638a7023e9?w=400"],
        reviews: []
    },
    {
        id: 4,
        name: "Color Pro Painters",
        cat: 'Painting',
        img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
        price: 800,
        rating: 4.7,
        loc: "North Hills",
        verified: false,
        desc: "Interior and exterior painting specialists. We bring color to your life with precision and care. Free consultations available.",
        social: { insta: "#", fb: "#" },
        gallery: ["https://images.unsplash.com/photo-1562259920-47afc305f369?w=400"],
        reviews: [{ u: "Alice", t: "Good work, but arrived a bit late.", r: 4, date: "3 weeks ago" }]
    },
    {
        id: 5,
        name: "Green Thumb Gardening",
        cat: 'Gardening',
        img: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
        price: 350,
        rating: 4.9,
        loc: "Suburbs",
        verified: true,
        desc: "Complete landscape design and maintenance. Lawn mowing, hedge trimming, and seasonal planting.",
        social: { fb: "#" },
        gallery: [],
        reviews: []
    },
    {
        id: 6,
        name: "Cool Breeze HVAC",
        cat: 'HVAC',
        img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
        price: 550,
        rating: 4.6,
        loc: "Uptown",
        verified: true,
        desc: "Air conditioning repair and installation experts. Keep your home cool in summer and warm in winter.",
        social: {},
        gallery: [],
        reviews: [{ u: "John", t: "Fixed my AC in an hour.", r: 5, date: "Last month" }]
    },
    {
        id: 7,
        name: "Safe Move Logistics",
        cat: "Moving",
        img: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&q=80",
        price: 1200,
        rating: 4.8,
        loc: "Citywide",
        verified: true,
        desc: "Stress-free moving services for homes and offices. We provide packing materials and handle fragile items with care.",
        social: { web: "#" },
        gallery: [],
        reviews: []
    },
    {
        id: 8,
        name: "FixIt Now Handyman",
        cat: "Handyman",
        img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
        price: 400,
        rating: 4.5,
        loc: "Southside",
        verified: false,
        desc: "General repairs, furniture assembly, and small odd jobs around the house.",
        social: {},
        gallery: [],
        reviews: []
    }
];

export const products: Product[] = [
    {
        id: 101,
        name: "CNC Lathe Machine X200",
        cat: 'Industrial',
        img: "https://images.unsplash.com/photo-1616789916666-88062400db46?w=800",
        price: 150000,
        moq: "1 Unit",
        supplier: "Global Machineries Ltd.",
        desc: "High-precision CNC lathe with automated tool changing and digital controls. Suitable for heavy industrial manufacturing.",
        gallery: []
    },
    {
        id: 102,
        name: "Industrial Safety Helmets",
        cat: 'Safety',
        img: "https://images.unsplash.com/photo-1596512296092-23c89658e23f?w=800",
        price: 450,
        moq: "50 Pcs",
        supplier: "SafeGear Pro",
        desc: "ISO certified hard hats made from reinforced ABS material. Adjustable strap and ventilation included.",
        gallery: []
    },
    {
        id: 103,
        name: "Corrugated Shipping Boxes",
        cat: 'Packaging',
        img: "https://images.unsplash.com/photo-1606856108154-1ae0248231c5?w=800",
        price: 15,
        moq: "500 Pcs",
        supplier: "PackIt Well Inc.",
        desc: "3-ply heavy duty shipping boxes. Eco-friendly and recyclable material. Custom printing available.",
        gallery: []
    },
    {
        id: 104,
        name: "Hydraulic Pump Series 5",
        cat: 'Industrial',
        img: "https://plus.unsplash.com/premium_photo-1664302152996-33923067eb21?w=800",
        price: 12000,
        moq: "2 Units",
        supplier: "HydraTech Solutions",
        desc: "Heavy duty hydraulic pump for construction machinery. 2-year manufacturer warranty included.",
        gallery: []
    },
    {
        id: 105,
        name: "LED Industrial Flood Lights",
        cat: "Electronics",
        img: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800",
        price: 1200,
        moq: "10 Pcs",
        supplier: "BrightSpark Electricals",
        desc: "50W Outdoor waterproof flood lights. IP65 rated with 50,000 hours lifespan.",
        gallery: []
    },
    {
        id: 106,
        name: "Stainless Steel Pipes",
        cat: "Industrial",
        img: "https://images.unsplash.com/photo-1535063404286-da44bdc0e118?w=800",
        price: 250,
        moq: "100 Kg",
        supplier: "SteelCo Traders",
        desc: "High-grade 304 stainless steel pipes for plumbing and industrial use. Rust resistant.",
        gallery: []
    }
];