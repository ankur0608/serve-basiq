// 'use client';

// import {
//     DollarSign, Briefcase, Star, Bell, Wallet, Filter, ShieldCheck, ArrowLeft,
//     Plus, Package, Image as ImageIcon, Loader2, Pencil, Trash2
// } from 'lucide-react';
// import { MapPin, Clock, ListChecks, Save, Navigation } from 'lucide-react';

// import { StatCard, ActivityItem, RequestCard, LeadCard } from './DashboardComponents';
// import { Line } from 'react-chartjs-2';
// import {
//     Chart as ChartJS, CategoryScale, LinearScale, PointElement,
//     LineElement, Title, Tooltip, Legend, Filler
// } from 'chart.js';
// import { useState, useEffect } from 'react';

// // Register ChartJS
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// // Chart Data
// const chartData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [{
//         label: 'Earnings',
//         data: [150, 280, 220, 400, 350, 500, 450],
//         borderColor: '#2563EB',
//         backgroundColor: (context: any) => {
//             const ctx = context.chart.ctx;
//             const gradient = ctx.createLinearGradient(0, 0, 0, 300);
//             gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
//             gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
//             return gradient;
//         },
//         fill: true,
//         tension: 0.4,
//         pointBackgroundColor: '#fff',
//         pointBorderColor: '#2563EB',
//         pointRadius: 6,
//     }]
// };

// const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { display: false } },
//     scales: {
//         y: { grid: { borderDash: [4, 4], color: '#e2e8f0' }, ticks: { callback: (v: any) => '$' + v } },
//         x: { grid: { display: false } }
//     }
// };

// /* --- 1. EXISTING VIEWS --- */

// export function DashboardHomeView({ stats, setActiveView, onBackToHome }: any) {
//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
//                     <p className="text-slate-500 text-sm mt-1">Welcome back, {stats?.service.name}!</p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={onBackToHome}
//                         className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
//                     >
//                         <ArrowLeft size={14} /> Back to Website
//                     </button>

//                     <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
//                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
//                     </span>
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats?.stats.revenue}`} trend="+12%" color="blue" />
//                 <StatCard icon={Briefcase} label="Jobs Completed" value={stats?.stats.jobsCompleted} color="purple" />
//                 <StatCard icon={Star} label="Average Rating" value={stats?.stats.rating} color="orange" />
//                 <div onClick={() => setActiveView('requests')} className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition">
//                     <div className="flex justify-between mb-4">
//                         <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Bell size={20} /></div>
//                         <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Action Needed</span>
//                     </div>
//                     <h3 className="text-2xl font-bold text-slate-900">{stats?.stats.pendingRequests}</h3>
//                     <p className="text-slate-400 text-xs font-medium">Pending Requests</p>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                     <h3 className="font-bold text-slate-900 mb-6">Revenue Analytics</h3>
//                     <div className="h-64">
//                         <Line data={chartData} options={chartOptions} />
//                     </div>
//                 </div>
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                     <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
//                     <div className="space-y-6 relative border-l border-slate-200 ml-2">
//                         <ActivityItem type="job" title="Pipe fixing at Block A" time="2 mins ago" />
//                         <ActivityItem type="request" title="Kitchen sink installation" time="1 hour ago" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export function RequestsView({ showToast }: any) {
//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Requests</h2>
//             <div className="space-y-4">
//                 <RequestCard
//                     id="req-1"
//                     title="Kitchen Tap Replacement"
//                     customer="John Doe"
//                     location="Downtown"
//                     price="65.00"
//                     urgent={true}
//                     onAccept={() => showToast('Booking Accepted', 'success')}
//                     onReject={() => showToast('Booking Rejected', 'error')}
//                 />
//                 <RequestCard
//                     id="req-2"
//                     title="Bathroom Inspection"
//                     customer="Sarah Smith"
//                     location="Westside"
//                     price="30.00"
//                     urgent={false}
//                     color="purple"
//                     onAccept={() => showToast('Booking Accepted', 'success')}
//                     onReject={() => showToast('Booking Rejected', 'error')}
//                 />
//             </div>
//         </div>
//     )
// }

// export function LeadsView() {
//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-slate-900">Open Leads</h2>
//                 <button className="bg-white p-2 rounded border hover:bg-slate-50"><Filter size={20} className="text-slate-600" /></button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <LeadCard title="Sink Installation" dist="4.5 km" time="20 mins ago" category="Plumbing" />
//                 <LeadCard title="Garden Hose Repair" dist="1.2 km" time="1 hour ago" category="Repair" color="orange" />
//                 <LeadCard title="Full House Check" dist="8.0 km" time="3 hours ago" category="Maintenance" color="blue" />
//             </div>
//         </div>
//     )
// }

// export function EarningsView() {
//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <h2 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
//                     <Wallet className="absolute top-0 right-0 m-8 w-32 h-32 opacity-10" />
//                     <p className="text-slate-400 font-medium mb-1">Available Balance</p>
//                     <h1 className="text-5xl font-bold mb-6">$450.00</h1>
//                     <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
//                         Withdraw Funds
//                     </button>
//                 </div>
//                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
//                     <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
//                     <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Today</span><span className="font-bold">$120.00</span></div>
//                     <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Pending</span><span className="font-bold text-yellow-600">$85.00</span></div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export function ProfileView({ stats }: any) {
//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
//                 <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
//                 <div className="px-6 pb-6 relative">
//                     <div className="flex justify-between items-end -mt-12 mb-4">
//                         <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white object-cover" />
//                         <button className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Edit</button>
//                     </div>
//                     <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
//                         {stats?.service.name} <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-100" />
//                     </h1>
//                     <p className="text-slate-500">{stats?.service.cat} Expert</p>
//                     <div className="mt-6">
//                         <h3 className="font-bold mb-2">About</h3>
//                         <p className="text-sm text-slate-600 leading-relaxed">{stats?.service.desc}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// /* --- 2. NEW PRODUCT VIEWS --- */

// // A. Product List View (Updated with Edit/Delete Logic)
// export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast }: any) {
//     const [products, setProducts] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     const fetchProducts = async () => {
//         if (!userId) return;
//         try {
//             const res = await fetch('/api/provider/products', {
//                 method: 'POST',
//                 body: JSON.stringify({ userId })
//             });
//             const data = await res.json();
//             if (data.success) setProducts(data.products);
//         } catch (e) { console.error(e); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchProducts(); }, [userId]);

//     // Handle Edit Click
//     const handleEdit = (product: any) => {
//         setSelectedProduct(product);
//         setActiveView('add-product');
//     };

//     // Handle Delete Click
//     const handleDelete = async (id: number) => {
//         if (!confirm("Are you sure you want to delete this product?")) return;

//         try {
//             const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
//             if (res.ok) {
//                 showToast("Product deleted successfully", "success");
//                 setProducts(products.filter(p => p.id !== id));
//             } else {
//                 showToast("Failed to delete", "error");
//             }
//         } catch (error) {
//             showToast("Error deleting product", "error");
//         }
//     };

//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-slate-900">My Products</h2>
//                 <button
//                     onClick={() => { setSelectedProduct(null); setActiveView('add-product'); }}
//                     className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
//                 >
//                     <Plus size={18} /> Add Product
//                 </button>
//             </div>

//             {loading ? (
//                 <div className="text-center py-20 text-slate-400">Loading products...</div>
//             ) : products.length === 0 ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
//                     <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
//                     <h3 className="text-slate-900 font-bold">No products yet</h3>
//                     <p className="text-slate-500 text-sm mb-4">Start selling your items today.</p>
//                     <button onClick={() => setActiveView('add-product')} className="text-blue-600 font-bold text-sm hover:underline">Add your first product</button>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {products.map((p) => (
//                         <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:shadow-md transition">
//                             <img src={p.img} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
//                             <div className="flex-1 flex flex-col justify-between">
//                                 <div>
//                                     <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
//                                     <div className="text-xs text-slate-500 mb-1">{p.cat} • MOQ: {p.moq}</div>
//                                     <div className="font-bold text-blue-600">₹{p.price}</div>
//                                 </div>
//                                 <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
//                                     <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
//                                         <Pencil size={14} />
//                                     </button>
//                                     <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
//                                         <Trash2 size={14} />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// // B. Add Product Form (Updated with Banking/KYC Fields & Edit Logic)
// export function AddProductView({ setActiveView, userId, showToast, editingProduct }: any) {
//     const [loading, setLoading] = useState(false);
//     const [uploading, setUploading] = useState(false);
//     const [image, setImage] = useState<string | null>(null);

//     // Initial State including new Banking/KYC fields
//     const [form, setForm] = useState({
//         name: '', cat: 'Spare Parts', price: '', moq: '', desc: '',
//         bank_account_holder_name: '',
//         bank_account_number: '',
//         ifsc_code: '',
//         upi_id: '',
//         payout_method: 'Bank Transfer',
//         id_proof_type: 'Aadhaar',
//         id_proof_number: '',
//         business_proof_type: 'GST',
//         gst_number: ''
//     });

//     // Populate form if editing
//     useEffect(() => {
//         if (editingProduct) {
//             setForm({
//                 name: editingProduct.name || '',
//                 cat: editingProduct.cat || 'Spare Parts',
//                 price: editingProduct.price || '',
//                 moq: editingProduct.moq || '',
//                 desc: editingProduct.desc || '',
//                 bank_account_holder_name: editingProduct.bank_account_holder_name || '',
//                 bank_account_number: editingProduct.bank_account_number || '',
//                 ifsc_code: editingProduct.ifsc_code || '',
//                 upi_id: editingProduct.upi_id || '',
//                 payout_method: editingProduct.payout_method || 'Bank Transfer',
//                 id_proof_type: editingProduct.id_proof_type || 'Aadhaar',
//                 id_proof_number: editingProduct.id_proof_number || '',
//                 business_proof_type: editingProduct.business_proof_type || 'GST',
//                 gst_number: editingProduct.gst_number || ''
//             });
//             setImage(editingProduct.img);
//         }
//     }, [editingProduct]);

//     // Handle Image Upload Logic
//     async function handleImageUpload(e: any) {
//         const file = e.target.files[0];
//         if (!file) return;
//         setUploading(true);

//         try {
//             const authRes = await fetch("/api/imagekit/auth");
//             const auth = await authRes.json();

//             const formData = new FormData();
//             formData.append("file", file);
//             formData.append("fileName", file.name);
//             formData.append("publicKey", auth.publicKey);
//             formData.append("signature", auth.signature);
//             formData.append("expire", String(auth.expire));
//             formData.append("token", auth.token);
//             formData.append("useUniqueFileName", "true");
//             formData.append("folder", "/products");

//             const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
//             const data = await res.json();

//             if (data.url) setImage(data.url);
//             else throw new Error("Upload failed");

//         } catch (e) {
//             alert("Image Upload failed. Please try again.");
//         } finally {
//             setUploading(false);
//         }
//     }

//     async function handleSubmit(e: any) {
//         e.preventDefault();
//         if (!image) return alert("Product image required");
//         setLoading(true);

//         const payload = {
//             userId,
//             ...form,
//             price: parseFloat(form.price),
//             img: image
//         };

//         try {
//             let res;
//             if (editingProduct) {
//                 // UPDATE
//                 res = await fetch(`/api/products/${editingProduct.id}`, {
//                     method: 'PATCH',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(payload)
//                 });
//             } else {
//                 // CREATE
//                 res = await fetch('/api/products/create', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(payload)
//                 });
//             }

//             if (!res.ok) throw new Error("Failed");

//             showToast(editingProduct ? "Product Updated!" : "Product Created!", "success");
//             setActiveView('products');
//         } catch (error) {
//             showToast("Operation failed", "error");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
//             <div className="flex items-center gap-4 mb-6">
//                 <button onClick={() => setActiveView('products')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ArrowLeft size={20} /></button>
//                 <h2 className="text-2xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
//             </div>

//             <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">

//                 {/* Image Upload */}
//                 <div className="flex justify-center">
//                     <div className="relative w-full h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden">
//                         <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
//                         {uploading ? (
//                             <Loader2 className="animate-spin text-blue-500" />
//                         ) : image ? (
//                             <img src={image} className="w-full h-full object-cover" />
//                         ) : (
//                             <div className="text-center text-slate-400">
//                                 <ImageIcon className="mx-auto mb-2" />
//                                 <span className="text-sm font-bold">Upload Product Image</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Section 1: Basic Info */}
//                 <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
//                     <div className="col-span-2 text-sm font-bold text-slate-900">Product Details</div>
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product Name</label>
//                         <input required value={form.name} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. Heavy Duty Drill" onChange={e => setForm({ ...form, name: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Price (₹)</label>
//                         <input required type="number" value={form.price} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="0.00" onChange={e => setForm({ ...form, price: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">MOQ</label>
//                         <input required value={form.moq} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. 5 Units" onChange={e => setForm({ ...form, moq: e.target.value })} />
//                     </div>
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
//                         <select value={form.cat} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, cat: e.target.value })}>
//                             <option>Spare Parts</option>
//                             <option>Tools</option>
//                             <option>Materials</option>
//                             <option>Safety Gear</option>
//                         </select>
//                     </div>
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
//                         <textarea required rows={3} value={form.desc} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="Product details..." onChange={e => setForm({ ...form, desc: e.target.value })} />
//                     </div>
//                 </div>

//                 {/* Section 2: Banking Info */}
//                 <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
//                     <div className="col-span-2 text-sm font-bold text-slate-900">Banking Information</div>
//                     <div className="col-span-2">
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Holder Name</label>
//                         <input value={form.bank_account_holder_name} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="Name on bank account" onChange={e => setForm({ ...form, bank_account_holder_name: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Number</label>
//                         <input type="number" value={form.bank_account_number} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="XXXXXXXXXXXX" onChange={e => setForm({ ...form, bank_account_number: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">IFSC Code</label>
//                         <input value={form.ifsc_code} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="ABCD0123456" onChange={e => setForm({ ...form, ifsc_code: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">UPI ID</label>
//                         <input value={form.upi_id} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="user@upi" onChange={e => setForm({ ...form, upi_id: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Payout Method</label>
//                         <select value={form.payout_method} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, payout_method: e.target.value })}>
//                             <option>Bank Transfer</option>
//                             <option>UPI</option>
//                             <option>Wallet</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Section 3: KYC / Business Proof */}
//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="col-span-2 text-sm font-bold text-slate-900">KYC & Verification</div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Proof Type</label>
//                         <select value={form.id_proof_type} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, id_proof_type: e.target.value })}>
//                             <option>Aadhaar</option>
//                             <option>PAN Card</option>
//                             <option>Voter ID</option>
//                             <option>Driving License</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Number</label>
//                         <input value={form.id_proof_number} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="ID Number" onChange={e => setForm({ ...form, id_proof_number: e.target.value })} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Business Proof</label>
//                         <select value={form.business_proof_type} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, business_proof_type: e.target.value })}>
//                             <option>GST</option>
//                             <option>Udyam</option>
//                             <option>Trade License</option>
//                             <option>None</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">GST/Reg Number</label>
//                         <input value={form.gst_number} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="Registration No." onChange={e => setForm({ ...form, gst_number: e.target.value })} />
//                     </div>
//                 </div>

//                 <button disabled={loading || uploading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2">
//                     {loading ? <Loader2 className="animate-spin" /> : (editingProduct ? "Update Product" : "Save Product")}
//                 </button>
//             </form>
//         </div>
//     );
// }

// // components/providers/DashboardViews.tsx (Add this at the bottom)


// export function ServiceSettingsView({ userId, showToast }: any) {
//     const [loading, setLoading] = useState(false);
//     const [gettingLoc, setGettingLoc] = useState(false);

//     const [form, setForm] = useState({
//         categoryId: '',
//         subCategoryIds: [] as string[],
//         addressLine1: '',
//         addressLine2: '',
//         city: '',
//         state: '',
//         pincode: '',
//         latitude: 0,
//         longitude: 0,
//         radiusKm: 10,
//         workingDays: [] as string[],
//         openTime: '09:00',
//         closeTime: '18:00'
//     });

//     // Mock Data (Replace with DB fetch later if needed)
//     const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//     const CATEGORIES = [
//         { id: 'cat_cleaning', name: 'Cleaning' },
//         { id: 'cat_repair', name: 'Repair' },
//         { id: 'cat_plumbing', name: 'Plumbing' },
//     ];

//     // Helper: Get Current Location
//     const handleGetLocation = () => {
//         if (!navigator.geolocation) return alert("Geolocation not supported");
//         setGettingLoc(true);
//         navigator.geolocation.getCurrentPosition(
//             (pos) => {
//                 setForm(prev => ({
//                     ...prev,
//                     latitude: pos.coords.latitude,
//                     longitude: pos.coords.longitude
//                 }));
//                 setGettingLoc(false);
//                 showToast("Location captured!", "success");
//             },
//             (err) => {
//                 console.error(err);
//                 setGettingLoc(false);
//                 alert("Failed to get location. Please allow permissions.");
//             }
//         );
//     };

//     const handleDayToggle = (day: string) => {
//         setForm(prev => ({
//             ...prev,
//             workingDays: prev.workingDays.includes(day)
//                 ? prev.workingDays.filter(d => d !== day)
//                 : [...prev.workingDays, day]
//         }));
//     };

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const res = await fetch('/api/services/create', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ userId, ...form })
//             });

//             const data = await res.json();

//             if (!res.ok) throw new Error(data.message || "Failed");

//             showToast("Service Details Updated!", "success");
//         } catch (error: any) {
//             showToast(error.message, "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Configuration</h2>

//             <form onSubmit={handleSubmit} className="space-y-6">

//                 {/* 1. Category Section */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//                     <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
//                         <ListChecks size={20} className="text-blue-600" /> Category & Skills
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Main Category</label>
//                             <select
//                                 className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 outline-none focus:border-blue-500"
//                                 value={form.categoryId}
//                                 onChange={e => setForm({ ...form, categoryId: e.target.value })}
//                                 required
//                             >
//                                 <option value="">Select Category</option>
//                                 {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Radius (km)</label>
//                             <input
//                                 type="number"
//                                 className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 outline-none focus:border-blue-500"
//                                 value={form.radiusKm}
//                                 onChange={e => setForm({ ...form, radiusKm: parseInt(e.target.value) })}
//                                 min="1" max="100"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* 2. Address & Location */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//                     <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
//                         <MapPin size={20} className="text-blue-600" /> Location Details
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="col-span-2">
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
//                             <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" placeholder="Shop No, Building" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} />
//                         </div>
//                         <div className="col-span-2">
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 2</label>
//                             <input className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" placeholder="Area, Landmark" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
//                             <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
//                             <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
//                             <input required maxLength={6} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
//                         </div>

//                         {/* Geo Location */}
//                         <div className="flex items-end">
//                             <button type="button" onClick={handleGetLocation} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-lg hover:bg-blue-100 transition font-bold text-sm h-[42px]">
//                                 {gettingLoc ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
//                                 {form.latitude ? "Update Location" : "Get Current Location"}
//                             </button>
//                         </div>
//                     </div>

//                     {form.latitude !== 0 && (
//                         <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 flex gap-4">
//                             <span>Lat: {form.latitude.toFixed(6)}</span>
//                             <span>Long: {form.longitude.toFixed(6)}</span>
//                         </div>
//                     )}
//                 </div>

//                 {/* 3. Availability */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//                     <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
//                         <Clock size={20} className="text-blue-600" /> Availability
//                     </div>

//                     <div className="mb-4">
//                         <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Working Days</label>
//                         <div className="flex gap-2 flex-wrap">
//                             {DAYS.map(day => (
//                                 <button
//                                     key={day}
//                                     type="button"
//                                     onClick={() => handleDayToggle(day)}
//                                     className={`w-10 h-10 rounded-full text-xs font-bold transition ${form.workingDays.includes(day)
//                                         ? 'bg-slate-900 text-white'
//                                         : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
//                                         }`}
//                                 >
//                                     {day}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Opening Time</label>
//                             <input type="time" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Closing Time</label>
//                             <input type="time" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
//                         </div>
//                     </div>
//                 </div>

//                 <button
//                     disabled={loading}
//                     className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
//                 >
//                     {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Service Details</>}
//                 </button>
//             </form>
//         </div>
//     );
// }