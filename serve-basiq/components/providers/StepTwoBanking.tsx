import { CreditCard } from 'lucide-react';

export default function StepTwoBanking({ form, updateField, getInputClass }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Banking Details</h3>
                    <p className="text-xs text-slate-500">For payouts and earnings</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Holder */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Account Holder
                    </label>
                    <input
                        value={form.bankAccountHolder}
                        onChange={e => updateField('bankAccountHolder', e.target.value)}
                        className={getInputClass('bankAccountHolder')}
                        placeholder="Name as per Bank"
                    />
                </div>

                {/* Account Number */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Account Number
                    </label>
                    <input
                        value={form.bankAccountNumber}
                        onChange={e => updateField('bankAccountNumber', e.target.value)}
                        className={getInputClass('bankAccountNumber')}
                        placeholder="Enter Account Number"
                    />
                </div>

                {/* IFSC Code */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        IFSC Code
                    </label>
                    <input
                        value={form.bankIfsc}
                        onChange={e => updateField('bankIfsc', e.target.value)}
                        className={getInputClass('bankIfsc')}
                        placeholder="e.g. SBIN0001234"
                    />
                </div>

                {/* Bank Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Bank Name
                    </label>
                    <input
                        value={form.bankName}
                        onChange={e => updateField('bankName', e.target.value)}
                        className={getInputClass('bankName')}
                        placeholder="e.g. State Bank of India"
                    />
                </div>

                {/* UPI ID */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        UPI ID (Optional)
                    </label>
                    <input
                        value={form.upiId}
                        onChange={e => updateField('upiId', e.target.value)}
                        className={getInputClass('upiId')}
                        placeholder="username@bank"
                    />
                </div>

                {/* Payout Method */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Payout Method
                    </label>
                    <select
                        value={form.preferredPayoutMethod}
                        onChange={e => updateField('preferredPayoutMethod', e.target.value)}
                        className={getInputClass('preferredPayoutMethod')}
                    >
                        <option value="BANK">Bank Transfer</option>
                        <option value="UPI">UPI Payout</option>
                    </select>
                </div>
            </div>
        </div>
    );
}