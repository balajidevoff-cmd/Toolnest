import React, { useState } from 'react';
import { calculateDaysBetween } from '../../../utils/dateCalc';
import { Calendar, Plus, Minus, ArrowRight } from 'lucide-react';

export const DateCalculatorTool: React.FC = () => {
  const [tab, setTab] = useState<'difference' | 'add-subtract'>('difference');

  // Tab 1: Days between
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  // Tab 2: Add / Subtract days
  const [baseDate, setBaseDate] = useState('2025-01-01');
  const [daysOffset, setDaysOffset] = useState<number>(30);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');

  // Diff result
  let diffDays = 0;
  try {
    diffDays = calculateDaysBetween(startDate, endDate);
  } catch {
    diffDays = 0;
  }

  // Offset result
  const calculateOffsetDate = (): string => {
    try {
      const d = new Date(baseDate);
      if (isNaN(d.getTime())) return 'Invalid date';
      const offset = operation === 'add' ? daysOffset : -daysOffset;
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Error calculating date';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('difference')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            tab === 'difference'
              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
              : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
          }`}
        >
          Days Between Two Dates
        </button>
        <button
          onClick={() => setTab('add-subtract')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            tab === 'add-subtract'
              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
              : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
          }`}
        >
          Add or Subtract Days
        </button>
      </div>

      {tab === 'difference' ? (
        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
              Elapsed Duration
            </span>
            <div className="text-4xl font-black text-light-text dark:text-dark-text">
              {diffDays} Days
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Equivalent to {(diffDays / 7).toFixed(1)} weeks or {(diffDays / 30.417).toFixed(1)} months
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Start / Base Date
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
                Operation
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 ${
                    operation === 'add'
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'border-light-border dark:border-dark-border text-light-muted'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Days</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('subtract')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 ${
                    operation === 'subtract'
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'border-light-border dark:border-dark-border text-light-muted'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Subtract Days</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                value={daysOffset}
                onChange={(e) => setDaysOffset(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
              Calculated Resulting Date
            </span>
            <div className="text-2xl sm:text-3xl font-black text-light-text dark:text-dark-text">
              {calculateOffsetDate()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
