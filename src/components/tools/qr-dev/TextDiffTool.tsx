import React, { useState } from 'react';
import { ArrowRightLeft, Trash2, Plus, Minus } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export const TextDiffTool: React.FC = () => {
  const [original, setOriginal] = useState(
    `function calculateTax(amount) {\n  const taxRate = 0.18;\n  return amount * taxRate;\n}`
  );
  const [modified, setModified] = useState(
    `function calculateTax(amount, state) {\n  const taxRate = state === 'NY' ? 0.08 : 0.18;\n  const total = amount * taxRate;\n  return total;\n}`
  );

  // Compute simple Myers / LCS line-by-line diff
  const computeDiff = (text1: string, text2: string): DiffLine[] => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    // Build Longest Common Subsequence matrix
    const n = lines1.length;
    const m = lines2.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff entries
    const diff: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        diff.unshift({ type: 'unchanged', text: lines1[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'added', text: lines2[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        diff.unshift({ type: 'removed', text: lines1[i - 1] });
        i--;
      }
    }

    return diff;
  };

  const diffResult = computeDiff(original, modified);

  const swapTexts = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  const clearAll = () => {
    setOriginal('');
    setModified('');
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <span className="text-xs font-semibold text-light-text dark:text-dark-text">
          Compare Text or Code
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={swapTexts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-rose-50 text-rose-500 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase text-rose-500">
            Original Text (Before)
          </label>
          <textarea
            rows={8}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full p-3.5 rounded-xl font-mono text-xs bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase text-emerald-500">
            Modified Text (After)
          </label>
          <textarea
            rows={8}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste updated text here..."
            className="w-full p-3.5 rounded-xl font-mono text-xs bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Line-by-Line Diff Preview
        </h3>
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden font-mono text-xs divide-y divide-light-border/40 dark:divide-dark-border/40 bg-black/[0.01] dark:bg-black/40">
          {diffResult.length > 0 ? (
            diffResult.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-start px-3 py-1.5 ${
                  line.type === 'added'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : line.type === 'removed'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'text-light-text dark:text-dark-text opacity-80'
                }`}
              >
                <span className="w-6 shrink-0 select-none opacity-50 flex items-center">
                  {line.type === 'added' && <Plus className="w-3.5 h-3.5" />}
                  {line.type === 'removed' && <Minus className="w-3.5 h-3.5" />}
                  {line.type === 'unchanged' && ' '}
                </span>
                <span className="w-8 shrink-0 select-none opacity-40 text-right pr-3">{idx + 1}</span>
                <span className="whitespace-pre-wrap break-all">{line.text || ' '}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-light-muted dark:text-dark-muted">
              Enter text in both boxes to compute differences.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
