'use client';

import {
    DollarSign, Briefcase, Star, Bell, Wallet, Filter, ShieldCheck, ArrowLeft,
    Plus, Package, Image as ImageIcon, Loader2
} from 'lucide-react';
import { StatCard, ActivityItem, RequestCard, LeadCard } from './DashboardComponents';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { useState, useEffect } from 'react';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Chart Data (Keep existing)
const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Earnings',
        data: [150, 280, 220, 400, 350, 500, 450],
        borderColor: '#2563EB',
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
            return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563EB',
        pointRadius: 6,
    }]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#e2e8f0' }, ticks: { callback: (v: any) => '$' + v } },
        x: { grid: { display: false } }
    }
};

/* --- 1. EXISTING VIEWS --- */

export function DashboardHomeView({ stats, setActiveView, onBackToHome }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Welcome back, {stats?.service.name}!</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onBackToHome}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={14} /> Back to Website
                    </button>

                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats?.stats.revenue}`} trend="+12%" color="blue" />
                <StatCard icon={Briefcase} label="Jobs Completed" value={stats?.stats.jobsCompleted} color="purple" />
                <StatCard icon={Star} label="Average Rating" value={stats?.stats.rating} color="orange" />
                <div onClick={() => setActiveView('requests')} className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition">
                    <div className="flex justify-between mb-4">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Bell size={20} /></div>
                        <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Action Needed</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats?.stats.pendingRequests}</h3>
                    <p className="text-slate-400 text-xs font-medium">Pending Requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6">Revenue Analytics</h3>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-6 relative border-l border-slate-200 ml-2">
                        <ActivityItem type="job" title="Pipe fixing at Block A" time="2 mins ago" />
                        <ActivityItem type="request" title="Kitchen sink installation" time="1 hour ago" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function RequestsView({ showToast }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Requests</h2>
            <div className="space-y-4">
                <RequestCard
                    id="req-1"
                    title="Kitchen Tap Replacement"
                    customer="John Doe"
                    location="Downtown"
                    price="65.00"
                    urgent={true}
                    onAccept={() => showToast('Booking Accepted', 'success')}
                    onReject={() => showToast('Booking Rejected', 'error')}
                />
                <RequestCard
                    id="req-2"
                    title="Bathroom Inspection"
                    customer="Sarah Smith"
                    location="Westside"
                    price="30.00"
                    urgent={false}
                    color="purple"
                    onAccept={() => showToast('Booking Accepted', 'success')}
                    onReject={() => showToast('Booking Rejected', 'error')}
                />
            </div>
        </div>
    )
}

export function LeadsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Open Leads</h2>
                <button className="bg-white p-2 rounded border hover:bg-slate-50"><Filter size={20} className="text-slate-600" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LeadCard title="Sink Installation" dist="4.5 km" time="20 mins ago" category="Plumbing" />
                <LeadCard title="Garden Hose Repair" dist="1.2 km" time="1 hour ago" category="Repair" color="orange" />
                <LeadCard title="Full House Check" dist="8.0 km" time="3 hours ago" category="Maintenance" color="blue" />
            </div>
        </div>
    )
}

export function EarningsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
                    <Wallet className="absolute top-0 right-0 m-8 w-32 h-32 opacity-10" />
                    <p className="text-slate-400 font-medium mb-1">Available Balance</p>
                    <h1 className="text-5xl font-bold mb-6">$450.00</h1>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
                        Withdraw Funds
                    </button>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Today</span><span className="font-bold">$120.00</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Pending</span><span className="font-bold text-yellow-600">$85.00</span></div>
                </div>
            </div>
        </div>
    )
}

export function ProfileView({ stats }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 mb-4">
                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white object-cover" />
                        <button className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Edit</button>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {stats?.service.name} <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-100" />
                    </h1>
                    <p className="text-slate-500">{stats?.service.cat} Expert</p>
                    <div className="mt-6">
                        <h3 className="font-bold mb-2">About</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{stats?.service.desc}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* --- 2. NEW PRODUCT VIEWS --- */

// A. Product List View
export function ProductsView({ setActiveView, userId }: any) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        async function fetchProducts() {
            try {
                const res = await fetch('/api/provider/products', {
                    method: 'POST',
                    body: JSON.stringify({ userId })
                });
                const data = await res.json();
                if (data.success) setProducts(data.products);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        fetchProducts();
    }, [userId]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">My Products</h2>
                <button
                    onClick={() => setActiveView('add-product')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-slate-900 font-bold">No products yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start selling your items today.</p>
                    <button onClick={() => setActiveView('add-product')} className="text-blue-600 font-bold text-sm hover:underline">Add your first product</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                            <img src={p.img} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                <div className="text-xs text-slate-500 mb-2">{p.cat} • MOQ: {p.moq}</div>
                                <div className="font-bold text-blue-600">₹{p.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// B. Add Product Form
export function AddProductView({ setActiveView, userId, showToast }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', cat: 'Spare Parts', price: '', moq: '', desc: '' });

    // Handle Image Upload Logic
    async function handleImageUpload(e: any) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        try {
            const authRes = await fetch("/api/imagekit/auth");
            const auth = await authRes.json();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", file.name);
            formData.append("publicKey", auth.publicKey);
            formData.append("signature", auth.signature);
            formData.append("expire", String(auth.expire));
            formData.append("token", auth.token);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", "/products");

            const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (data.url) setImage(data.url);
            else throw new Error("Upload failed");

        } catch (e) {
            alert("Image Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!image) return alert("Product image required");
        setLoading(true);

        try {
            const res = await fetch('/api/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    name: form.name,
                    cat: form.cat,
                    price: parseFloat(form.price),
                    moq: form.moq,
                    desc: form.desc,
                    img: image
                })
            });

            if (!res.ok) throw new Error("Failed");

            showToast("Product Created Successfully!", "success");
            setActiveView('products');
        } catch (error) {
            showToast("Failed to create product", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveView('products')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ArrowLeft size={20} /></button>
                <h2 className="text-2xl font-bold text-slate-900">Add New Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">

                {/* Image Upload */}
                <div className="flex justify-center">
                    <div className="relative w-full h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden">
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {uploading ? (
                            <Loader2 className="animate-spin text-blue-500" />
                        ) : image ? (
                            <img src={image} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <ImageIcon className="mx-auto mb-2" />
                                <span className="text-sm font-bold">Upload Product Image</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product Name</label>
                        <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. Heavy Duty Drill" onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Price (₹)</label>
                        <input required type="number" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="0.00" onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">MOQ</label>
                        <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. 5 Units" onChange={e => setForm({ ...form, moq: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
                        <select className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, cat: e.target.value })}>
                            <option>Spare Parts</option>
                            <option>Tools</option>
                            <option>Materials</option>
                            <option>Safety Gear</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                        <textarea required rows={3} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="Product details..." onChange={e => setForm({ ...form, desc: e.target.value })} />
                    </div>
                </div>

                <button disabled={loading || uploading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : "Save Product"}
                </button>
            </form>
        </div>
    );
}