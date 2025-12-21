'use client';

import { useState } from 'react';
import Link from 'next/link';
import { wallets, walletTransactions } from '@/lib/db';
import {
    FaWallet, FaArrowUp, FaArrowDown, FaPlus,
    FaArrowLeft, FaArrowRight
} from 'react-icons/fa6';
import clsx from 'clsx';

const sourceLabels: Record<string, string> = {
    SERVICE: 'Service Booking',
    LEAD: 'Lead Purchase',
    REFUND: 'Refund',
    PAYOUT: 'Payout',
    ORDER: 'Product Order',
    TOPUP: 'Wallet Top-up',
};

export default function WalletPage() {
    const [showTopup, setShowTopup] = useState(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const wallet = wallets.find(w => w.userId === 'user-1');
    const transactions = wallet ? walletTransactions.filter(t => t.walletId === wallet.id) : [];

    const handleTopup = async () => {
        if (!topupAmount || parseInt(topupAmount) <= 0) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setShowTopup(false);
        setTopupAmount('');
        // In real app, would update wallet balance
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
            {/* Back Button */}
            <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 mb-6 transition"
            >
                <FaArrowLeft /> Back to profile
            </Link>

            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-[40px] border-white" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-[30px] border-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaWallet className="text-xl" />
                        </div>
                        <div>
                            <div className="text-sm text-white/70">Available Balance</div>
                            <div className="text-3xl font-bold">₹{wallet?.balance.toLocaleString() || 0}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowTopup(true)}
                        className="bg-white text-brand-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-50 transition"
                    >
                        <FaPlus /> Add Money
                    </button>
                </div>
            </div>

            {/* Top-up Modal */}
            {showTopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
                        <h3 className="font-bold text-xl text-slate-900 mb-6">Add Money to Wallet</h3>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    placeholder="1000"
                                    className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-2xl font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6">
                            {[500, 1000, 2000, 5000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setTopupAmount(amt.toString())}
                                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:border-brand-500 hover:text-brand-600 transition"
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTopup(false)}
                                className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopup}
                                disabled={loading || !topupAmount}
                                className="flex-1 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Add Money'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions */}
            <div>
                <h2 className="font-bold text-xl text-slate-900 mb-4">Transaction History</h2>

                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map(txn => (
                            <div
                                key={txn.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    txn.type === 'CREDIT'
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                )}>
                                    {txn.type === 'CREDIT' ? <FaArrowDown /> : <FaArrowUp />}
                                </div>

                                <div className="flex-1">
                                    <div className="font-bold text-slate-900">{sourceLabels[txn.source]}</div>
                                    <div className="text-sm text-gray-500">
                                        {txn.description || sourceLabels[txn.source]}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className={clsx(
                                    "font-bold text-lg",
                                    txn.type === 'CREDIT' ? "text-green-600" : "text-red-600"
                                )}>
                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <FaWallet className="text-3xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No transactions yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
