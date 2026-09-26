import React, { useState, useEffect } from 'react';
import { Delete, RotateCcw, Equal } from 'lucide-react';
import { evaluateMathExpression } from '../../../utils/mathParser';

export const ScientificCalculatorTool: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string>('0');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const append = (val: string) => {
    setError(null);
    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setError(null);
  };

  const handleBackspace = () => {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!expression.trim()) return;

    try {
      const val = evaluateMathExpression(expression);
      const formatted = Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
      setResult(formatted);
      setHistory((prev) => [`${expression} = ${formatted}`, ...prev.slice(0, 9)]);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation error';
      setError(msg);
      setResult('Error');
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '(', ')', '.', '%', '^'].includes(e.key)) {
        append(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression]);

  const buttonRows = [
    ['sin(', 'cos(', 'tan(', '(', ')'],
    ['sqrt(', 'log(', 'ln(', '^', '÷'],
    ['7', '8', '9', '×', '!'],
    ['4', '5', '6', '-', '%'],
    ['1', '2', '3', '+', 'π'],
    ['0', '.', 'e'],
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Display screen */}
      <div className="p-5 rounded-2xl bg-black/[0.04] dark:bg-black/50 border border-light-border dark:border-dark-border text-right space-y-2">
        <div className="h-6 font-mono text-sm text-light-muted dark:text-dark-muted overflow-x-auto whitespace-nowrap">
          {expression || ' '}
        </div>
        <div
          className={`font-mono text-3xl sm:text-4xl font-black tracking-tight ${
            error ? 'text-rose-500' : 'text-light-text dark:text-dark-text'
          }`}
        >
          {error ? error : result}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleClear}
          className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear (C)</span>
        </button>

        <button
          onClick={handleBackspace}
          className="flex-1 py-2 rounded-xl border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Delete className="w-3.5 h-3.5" />
          <span>Backspace</span>
        </button>
      </div>

      {/* Keypad Grid */}
      <div className="space-y-2">
        {buttonRows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-5 gap-2">
            {row.map((btn) => {
              const isOperator = ['+', '-', '×', '÷', '^', '%', '!'].includes(btn);
              const isFunction = ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', 'ln('].includes(btn);

              return (
                <button
                  key={btn}
                  onClick={() => append(btn)}
                  className={`py-3.5 rounded-xl font-mono text-sm font-semibold transition-all active:scale-95 ${
                    isOperator
                      ? 'bg-brand-purple/15 text-brand-purple dark:text-brand-accentLight border border-brand-purple/20 hover:bg-brand-purple/25'
                      : isFunction
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 text-xs'
                      : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-black/5 dark:hover:bg-white/5 shadow-sm'
                  }`}
                >
                  {btn}
                </button>
              );
            })}
            {rowIdx === 5 && (
              <button
                onClick={handleCalculate}
                className="col-span-2 py-3.5 rounded-xl bg-brand-purple hover:bg-brand-accent text-white font-bold text-lg flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
              >
                <Equal className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-light-border dark:border-dark-border space-y-2">
          <span className="text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Calculation History
          </span>
          <div className="space-y-1 font-mono text-xs text-light-muted dark:text-dark-muted">
            {history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-1.5 rounded bg-black/[0.02] dark:bg-white/[0.02]">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
