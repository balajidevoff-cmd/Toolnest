import React, { useState } from 'react';
import { estimatePasswordStrength } from '../../../utils/passwords';
import { AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

export const PasswordStrengthTool: React.FC = () => {
  const [password, setPassword] = useState('P@ssw0rd!Secure2025');
  const [showPassword, setShowPassword] = useState(false);

  const evaluation = estimatePasswordStrength(password);

  const scoreColors = [
    'bg-rose-500',
    'bg-rose-400',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-emerald-400',
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Privacy Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Local Heuristic Evaluation</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            This tool evaluates password entropy, character diversity, and length directly on your device. We <strong>never transmit</strong> your password over any network, nor do we check against third-party breach APIs without disclosure.
          </p>
        </div>
      </div>

      {/* Input Field */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Enter Password to Evaluate
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type password..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border font-mono text-base text-light-text dark:text-dark-text focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-light-muted hover:text-light-text"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-light-muted dark:text-dark-muted">Estimated Strength</span>
            <span
              className={`font-bold ${
                evaluation.score >= 3
                  ? 'text-emerald-500'
                  : evaluation.score === 2
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            >
              {evaluation.label} (~{evaluation.entropyBits} bits of entropy)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 h-2">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-colors ${
                  step <= evaluation.score ? scoreColors[evaluation.score] : 'bg-black/10 dark:bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {evaluation.suggestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text">
            Security Recommendations
          </h4>
          <ul className="space-y-1.5 text-xs text-light-muted dark:text-dark-muted">
            {evaluation.suggestions.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
