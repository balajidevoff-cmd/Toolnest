import React, { useState } from 'react';
import { calculatePercentageChange, calculatePercentageWhatIs, calculatePercentOf } from '../../../utils/percentage';
import { ArrowRight, Percent } from 'lucide-react';

export const PercentageCalculatorTool: React.FC = () => {
  // Case 1: What is X% of Y?
  const [p1, setP1] = useState<number>(15);
  const [v1, setV1] = useState<number>(200);

  // Case 2: X is what percent of Y?
  const [x2, setX2] = useState<number>(45);
  const [y2, setY2] = useState<number>(180);

  // Case 3: Percentage change from A to B
  const [from3, setFrom3] = useState<number>(120);
  const [to3, setTo3] = useState<number>(150);

  // Compute results
  let res1 = '0';
  try {
    res1 = calculatePercentOf(p1, v1).toFixed(2);
  } catch {
    res1 = 'Error';
  }

  let res2 = '0';
  try {
    res2 = `${calculatePercentageWhatIs(x2, y2)}%`;
  } catch {
    res2 = 'Error (Div by 0)';
  }

  let res3 = '0';
  let type3: 'increase' | 'decrease' | 'no-change' = 'no-change';
  try {
    const r3 = calculatePercentageChange(from3, to3);
    res3 = `${Math.abs(r3.changePercent)}%`;
    type3 = r3.type;
  } catch {
    res3 = 'Error (Div by 0)';
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Mode 1 */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-light-text dark:text-dark-text flex items-center gap-2">
          <Percent className="w-4 h-4 text-brand-purple" />
          <span>Calculate What is X% of Y</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <span>What is</span>
          <input
            type="number"
            value={p1}
            onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <span>% of</span>
          <input
            type="number"
            value={v1}
            onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <ArrowRight className="w-4 h-4 text-brand-purple" />
          <span className="px-4 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple font-mono font-bold text-base">
            {res1}
          </span>
        </div>
      </div>

      {/* Mode 2 */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-light-text dark:text-dark-text flex items-center gap-2">
          <Percent className="w-4 h-4 text-indigo-500" />
          <span>Calculate X is What Percent of Y</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <input
            type="number"
            value={x2}
            onChange={(e) => setX2(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <span>is what percent of</span>
          <input
            type="number"
            value={y2}
            onChange={(e) => setY2(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <ArrowRight className="w-4 h-4 text-indigo-500" />
          <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-base">
            {res2}
          </span>
        </div>
      </div>

      {/* Mode 3 */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-light-text dark:text-dark-text flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-500" />
          <span>Percentage Increase / Decrease (Change)</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <span>From</span>
          <input
            type="number"
            value={from3}
            onChange={(e) => setFrom3(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <span>to</span>
          <input
            type="number"
            value={to3}
            onChange={(e) => setTo3(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-light-border dark:border-dark-border font-mono text-center focus:outline-none"
          />
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          <span
            className={`px-4 py-1.5 rounded-lg font-mono font-bold text-base ${
              type3 === 'increase'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : type3 === 'decrease'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-black/5 text-light-text'
            }`}
          >
            {type3 === 'increase' && '+'}
            {type3 === 'decrease' && '-'}
            {res3} ({type3})
          </span>
        </div>
      </div>
    </div>
  );
};
