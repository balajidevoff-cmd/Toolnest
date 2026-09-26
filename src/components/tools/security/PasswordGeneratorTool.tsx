import React, { useState, useEffect } from 'react';
import { generateSecurePassword, type PasswordOptions } from '../../../utils/passwords';
import { Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const PasswordGeneratorTool: React.FC = () => {
  const { addToast } = useApp();
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    try {
      const generated = generateSecurePassword(options);
      setPassword(generated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please check at least one character type';
      addToast({ type: 'warning', message: msg });
    }
  };

  useEffect(() => {
    generate();
  }, [options]);

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Secure password copied! Never stored persistently.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Generated Password Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Secure Password</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-light-muted hover:text-light-text"
              title="Generate new password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={copyPassword}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-lg sm:text-xl font-bold text-light-text dark:text-dark-text break-all select-all tracking-wide text-center">
          {password}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-5">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-light-muted dark:text-dark-muted uppercase">Password Length</span>
            <span className="font-mono text-base text-brand-purple font-bold">{options.length}</span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value, 10) })}
            className="w-full accent-brand-purple cursor-pointer"
          />
        </div>

        {/* Character Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-light-border dark:border-dark-border text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-light-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="rounded accent-brand-purple"
            />
            <span>Uppercase Letters (A-Z)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-light-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="rounded accent-brand-purple"
            />
            <span>Lowercase Letters (a-z)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-light-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="rounded accent-brand-purple"
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-light-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              className="rounded accent-brand-purple"
            />
            <span>Special Symbols (!@#$%)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-light-text dark:text-dark-text sm:col-span-2">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              className="rounded accent-brand-purple"
            />
            <span>Exclude Ambiguous Characters (e.g. i, l, 1, L, o, 0, O)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
