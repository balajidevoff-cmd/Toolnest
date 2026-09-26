import React, { useState } from 'react';
import { calculateExactAge, AgeResult } from '../../../utils/dateCalc';
import { Calendar, Cake, Clock, AlertCircle } from 'lucide-react';

export const AgeCalculatorTool: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [ageResult, setAgeResult] = useState<AgeResult | null>(() => {
    try {
      return calculateExactAge('2000-01-01');
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (dateStr: string) => {
    setBirthDate(dateStr);
    if (!dateStr) {
      setAgeResult(null);
      setError(null);
      return;
    }
    try {
      const res = calculateExactAge(dateStr);
      setAgeResult(res);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid date';
      setError(msg);
      setAgeResult(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Date input */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Select Your Date of Birth
        </label>
        <div className="relative">
          <input
            type="date"
            value={birthDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-base text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {ageResult && (
        <div className="space-y-4">
          {/* Main Age Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
              Your Current Age
            </span>
            <div className="text-3xl sm:text-4xl font-black text-light-text dark:text-dark-text">
              {ageResult.years} Years, {ageResult.months} Months, {ageResult.days} Days
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">
                  Next Birthday In
                </span>
                <p className="text-base font-bold text-light-text dark:text-dark-text mt-0.5">
                  {ageResult.nextBirthdayDays === 0 ? '🎉 Today is your birthday!' : `${ageResult.nextBirthdayDays} Days`}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">
                  Total Days Lived
                </span>
                <p className="text-base font-bold text-light-text dark:text-dark-text mt-0.5">
                  {ageResult.totalDays.toLocaleString()} Days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
