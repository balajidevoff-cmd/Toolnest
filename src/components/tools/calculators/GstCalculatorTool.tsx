import React, { useState } from 'react';
import { Receipt, Info } from 'lucide-react';

export const GstCalculatorTool: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [calculationType, setCalculationType] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Exclusive: Amount is base, add GST on top
  // Inclusive: Amount includes GST, calculate base and tax component
  let netAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (calculationType === 'exclusive') {
    netAmount = amount;
    gstAmount = (amount * taxRate) / 100;
    totalAmount = netAmount + gstAmount;
  } else {
    totalAmount = amount;
    netAmount = amount / (1 + taxRate / 100);
    gstAmount = totalAmount - netAmount;
  }

  const standardRates = [5, 12, 18, 28];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Tax Advisory Notice</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            GST and VAT regulations vary across states and product classifications. Please verify applicable slab rates with your financial advisor or official statutory portal.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-6">
        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setCalculationType('exclusive')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              calculationType === 'exclusive'
                ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                : 'border-light-border dark:border-dark-border text-light-muted'
            }`}
          >
            GST Exclusive (Add Tax to Base)
          </button>
          <button
            onClick={() => setCalculationType('inclusive')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              calculationType === 'inclusive'
                ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                : 'border-light-border dark:border-dark-border text-light-muted'
            }`}
          >
            GST Inclusive (Extract Tax from Total)
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              {calculationType === 'exclusive' ? 'Base Amount' : 'Total Invoice Amount'}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              GST Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
            />
          </div>
        </div>

        {/* Quick rate chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-light-muted dark:text-dark-muted font-medium">Standard slabs:</span>
          {standardRates.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTaxRate(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                taxRate === r
                  ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/30'
                  : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
              }`}
            >
              {r}%
            </button>
          ))}
        </div>

        {/* Breakdown output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-light-border dark:border-dark-border">
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-center">
            <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Net Base Amount</span>
            <p className="text-lg font-bold font-mono text-light-text dark:text-dark-text mt-1">
              ₹{netAmount.toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-center">
            <span className="text-[11px] font-semibold uppercase text-brand-purple dark:text-brand-accentLight">GST Tax ({taxRate}%)</span>
            <p className="text-lg font-bold font-mono text-brand-purple dark:text-brand-accentLight mt-1">
              ₹{gstAmount.toFixed(2)}
            </p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5">
              CGST: ₹{(gstAmount / 2).toFixed(2)} • SGST: ₹{(gstAmount / 2).toFixed(2)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Total Payable</span>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
